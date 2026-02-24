resource "kubernetes_manifest" "deployment" {
  manifest = yamldecode(file("../backend/deployment.yaml"))
}

resource "kubernetes_manifest" "service" {
  manifest = yamldecode(file("../backend/service.yaml"))
}
