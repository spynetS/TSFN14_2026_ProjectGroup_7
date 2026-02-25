resource "kubernetes_manifest" "deployment" {
  manifest = yamldecode(file("../manifests/deployment.yaml"))
}

resource "kubernetes_manifest" "mongo-deployment" {
  manifest = yamldecode(file("../manifests/mongo-deployment.yaml"))
}

resource "kubernetes_manifest" "service" {
  manifest = yamldecode(file("../manifests/service.yaml"))
}

resource "kubernetes_manifest" "mongo-service" {
  manifest = yamldecode(file("../manifests/mongo-service.yaml"))
}

