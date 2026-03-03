variable "location" {
  default = "swedencentral"
}

variable "resource_group_name" {
  default = "rg-aks-terraform"
}

variable "cluster_name" {
  default = "fitnessduel-aks"
}

variable "node_count" {
  default = 1
}

variable "vm_size" {
  default = "standard_b2as_v2"
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
  default = "fitnessduelacr"
}

variable "dns_prefix" {
  type    = string
  default = "fitnessduel"
}
