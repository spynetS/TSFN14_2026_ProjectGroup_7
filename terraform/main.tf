resource "kubernetes_manifest" "deployment" {
  manifest = yamldecode(file("../backend/manifests/deployment.yaml"))
}

resource "kubernetes_manifest" "mongo-deployment" {
  manifest = yamldecode(file("../backend/manifests/mongo-deployment.yaml"))
}

resource "kubernetes_manifest" "service" {
  manifest = yamldecode(file("../backend/manifests/service.yaml"))
}

resource "kubernetes_manifest" "mongo-service" {
  manifest = yamldecode(file("../backend/manifests/mongo-service.yaml"))
}

