variable "project" {
  type        = string
  description = "Short project name used in Azure resource names."
  default     = "compensa"
}

variable "environment" {
  type        = string
  description = "Deployment environment name."
  default     = "prod"
}

variable "resource_group_name" {
  type        = string
  description = "Azure Resource Group name for the Compensa+ deployment."
  default     = "compensa-rg"
}

variable "location" {
  type        = string
  description = "Azure region."
  default     = "westeurope"
}

variable "admin_username" {
  type        = string
  description = "Linux administrator username for all VMs."
  default     = "azureuser"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key allowed to access the manager VM."
  sensitive   = true
}

variable "admin_source_cidrs" {
  type        = list(string)
  description = "CIDR ranges allowed to SSH into the public manager VM."
  default     = ["0.0.0.0/0"]
}

variable "vnet_cidr" {
  type        = string
  description = "Address space for the Compensa+ virtual network."
  default     = "10.0.0.0/16"
}

variable "subnets" {
  type = object({
    app  = string
    data = string
    ops  = string
  })
  description = "Subnet CIDRs by platform layer."
  default = {
    app  = "10.0.1.0/24"
    data = "10.0.2.0/24"
    ops  = "10.0.3.0/24"
  }
}

variable "vm_sizes" {
  type        = map(string)
  description = "Azure VM size by Compensa+ VM role."
  default = {
    manager = "Standard_B2ms"
    backend = "Standard_B2ms"
    db      = "Standard_B2ms"
    cache   = "Standard_B2s"
    ops     = "Standard_B2s"
  }
}

variable "db_data_disk_size_gb" {
  type        = number
  description = "Managed data disk size for the database VM."
  default     = 64
}

variable "acr_name" {
  type        = string
  description = "Globally unique Azure Container Registry name. Defaults to a project/environment-derived name."
  default     = null
}

variable "key_vault_name" {
  type        = string
  description = "Globally unique Azure Key Vault name. Defaults to a project/environment-derived name."
  default     = null
}

variable "tags" {
  type        = map(string)
  description = "Common Azure tags."
  default     = {}
}
