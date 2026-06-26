locals {
  name_prefix = "${var.project}-${var.environment}"
  common_tags = merge(var.tags, {
    project     = var.project
    environment = var.environment
    managed_by  = "terraform"
  })
  acr_name       = coalesce(var.acr_name, replace("${var.project}${var.environment}acr", "-", ""))
  key_vault_name = coalesce(var.key_vault_name, substr(replace("${local.name_prefix}-kv", "-", ""), 0, 24))

  vms = {
    manager = {
      name      = "compensa-swarm-manager"
      subnet    = "app"
      role      = "manager"
      public_ip = true
    }
    backend = {
      name      = "compensa-backend"
      subnet    = "app"
      role      = "backend"
      public_ip = false
    }
    db = {
      name      = "compensa-db"
      subnet    = "data"
      role      = "db"
      public_ip = false
    }
    cache = {
      name      = "compensa-cache"
      subnet    = "data"
      role      = "cache"
      public_ip = false
    }
    ops = {
      name      = "compensa-ops"
      subnet    = "ops"
      role      = "ops"
      public_ip = false
    }
  }
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.common_tags
}

resource "azurerm_virtual_network" "main" {
  name                = "${local.name_prefix}-vnet"
  address_space       = [var.vnet_cidr]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}

resource "azurerm_subnet" "subnets" {
  for_each             = var.subnets
  name                 = "${each.key}-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [each.value]
}

resource "azurerm_network_security_group" "app" {
  name                = "${local.name_prefix}-app-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags

  security_rule {
    name                       = "AllowInternetHttpHttps"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["80", "443"]
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowAdminSsh"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefixes    = var.admin_source_cidrs
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowVnetInternal"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "VirtualNetwork"
    destination_address_prefix = "VirtualNetwork"
  }
}

resource "azurerm_network_security_group" "private" {
  name                = "${local.name_prefix}-private-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags

  security_rule {
    name                       = "AllowVnetInternal"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "VirtualNetwork"
    destination_address_prefix = "VirtualNetwork"
  }
}

resource "azurerm_subnet_network_security_group_association" "app" {
  subnet_id                 = azurerm_subnet.subnets["app"].id
  network_security_group_id = azurerm_network_security_group.app.id
}

resource "azurerm_subnet_network_security_group_association" "data" {
  subnet_id                 = azurerm_subnet.subnets["data"].id
  network_security_group_id = azurerm_network_security_group.private.id
}

resource "azurerm_subnet_network_security_group_association" "ops" {
  subnet_id                 = azurerm_subnet.subnets["ops"].id
  network_security_group_id = azurerm_network_security_group.private.id
}

resource "azurerm_public_ip" "manager" {
  name                = "${local.name_prefix}-manager-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.common_tags
}

resource "azurerm_network_interface" "vm" {
  for_each            = local.vms
  name                = "${each.value.name}-nic"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnets[each.value.subnet].id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = each.value.public_ip ? azurerm_public_ip.manager.id : null
  }
}

resource "azurerm_linux_virtual_machine" "vm" {
  for_each                        = local.vms
  name                            = each.value.name
  location                        = azurerm_resource_group.main.location
  resource_group_name             = azurerm_resource_group.main.name
  size                            = var.vm_sizes[each.value.role]
  admin_username                  = var.admin_username
  disable_password_authentication = true
  network_interface_ids           = [azurerm_network_interface.vm[each.key].id]
  tags                            = merge(local.common_tags, { role = each.value.role })

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.ssh_public_key
  }

  identity {
    type = "SystemAssigned"
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }
}

resource "azurerm_managed_disk" "db_data" {
  name                 = "${local.name_prefix}-db-data"
  location             = azurerm_resource_group.main.location
  resource_group_name  = azurerm_resource_group.main.name
  storage_account_type = "Premium_LRS"
  create_option        = "Empty"
  disk_size_gb         = var.db_data_disk_size_gb
  tags                 = local.common_tags
}

resource "azurerm_virtual_machine_data_disk_attachment" "db_data" {
  managed_disk_id    = azurerm_managed_disk.db_data.id
  virtual_machine_id = azurerm_linux_virtual_machine.vm["db"].id
  lun                = 0
  caching            = "ReadWrite"
}

resource "azurerm_container_registry" "acr" {
  name                = local.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = false
  tags                = local.common_tags
}

resource "azurerm_key_vault" "main" {
  name                       = local.key_vault_name
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  purge_protection_enabled   = true
  soft_delete_retention_days = 7
  tags                       = local.common_tags
}

data "azurerm_client_config" "current" {}
