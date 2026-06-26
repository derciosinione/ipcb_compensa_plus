output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "manager_public_ip" {
  value = azurerm_public_ip.manager.ip_address
}

output "key_vault_name" {
  value = azurerm_key_vault.main.name
}

output "vm_private_ips" {
  value = {
    for key, nic in azurerm_network_interface.vm :
    key => nic.private_ip_address
  }
}

output "ansible_inventory" {
  value = templatefile("${path.module}/templates/inventory.ini.tftpl", {
    admin_username    = var.admin_username
    manager_public_ip = azurerm_public_ip.manager.ip_address
    vms               = local.vms
    private_ips       = { for key, nic in azurerm_network_interface.vm : key => nic.private_ip_address }
  })
}
