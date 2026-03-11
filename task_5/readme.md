# Task 5


## Probes
Kubernetes will check the propes every 5 seconds and check whether the pod is	responding on the health endpoints.

```yaml
        startupProbe:
          httpGet:
            path: /api/started
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

        livenessProbe:
          httpGet:
            path: /api/alive
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
```


The startup and liveness-probe will just return "OK" if the server is running.

The Readiness-probe will check if the database is connected and return "READY" if ready or "DB NOT CONNECTED" if not.

A screenshot of the probes working correctly is found at "./propes_on_azure.png"

If the probes fail Kubernetes will try to restart the pods.
