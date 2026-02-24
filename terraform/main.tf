resource "kubernetes_pod" "nginx" {
  metadata {
    name = "nginx"
    labels = {
      app = "nginx"
    }
  }

  spec {
    container {
      image = "nginx:1.23"
      name  = "nginx"
      port {
        container_port = 80
      }
    }
  }
}

resource "kubernetes_service" "nginx" {
  metadata {
    name = "nginx-service"
  }

  spec {
    selector = {
      app = kubernetes_pod.nginx.metadata[0].labels.app
    }

    port {
      port        = 80
      target_port = 80
    }

    type = "NodePort"
  }
}