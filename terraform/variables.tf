variable "location" {
  default = "swedencentral"
}

variable "resource_group_name" {
  default = "rg-aks-terraform"
}

variable "cluster_name" {
  default = "fittnessduel-aks"
}

variable "node_count" {
  default = 1
}

variable "vm_size" {
  default = "standard_b2s"
}

# Optional custom node image ID (Managed Image)
variable "custom_node_image_id" {
  default = ""
}


variable "acr_name_prefix" {
  type    = string
  default = "task3"
}


# Container registry info
variable "acr_name" {
  default = "fittnessduelacr"
}

variable "dns_prefix" {
  type    = string
  default = "fittnessduel"
}
