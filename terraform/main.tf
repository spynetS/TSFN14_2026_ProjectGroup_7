resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}


resource "azurerm_container_registry" "acr" {
  name                = "${var.acr_name_prefix}${random_string.suffix.result}" # unikt
  resource_group_name = azurerm_resource_group.rg.name 
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = false
}

# resource "azurerm_virtual_network" "vnet" {
#   name                = "aks-vnet"
#   address_space       = ["10.0.0.0/8"]
#   location            = azurerm_resource_group.rg.location
#   resource_group_name = azurerm_resource_group.rg.name
# }

# resource "azurerm_subnet" "subnet" {
#   name                 = "aks-subnet"
#   resource_group_name  = azurerm_resource_group.rg.name
#   virtual_network_name = azurerm_virtual_network.vnet.name
#   address_prefixes     = ["10.240.0.0/16"]
# }


resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.cluster_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = var.dns_prefix

  default_node_pool {
    name           = "system"
    node_count     = var.node_count
    vm_size        = var.vm_size
#    vnet_subnet_id = azurerm_subnet.subnet.id

    # Optional custom node image
    # dynamic "node_image_id" {
    #   for_each = var.custom_node_image_id != "" ? [1] : []
    #   content  = var.custom_node_image_id
    # }
  }

  identity {
    type = "SystemAssigned"
  }

  # network_profile {
  #   network_plugin    = "azure"
  #   load_balancer_sku = "standard"
  # }

  # tags = {
  #   environment = "dev"
  # }
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.aks.identity[0].principal_id
}
