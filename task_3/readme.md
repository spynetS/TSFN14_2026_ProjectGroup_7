# Task 3

We have implemented terraform for minikube because we had problems with azure. Terraform will now deploy our backend and a mongo database on minikube.

## How to

```bash
minikube start
cd backend
minikube image build -t fittnessduel-backend:1.0.0 ./
cd ../terraform
terraform init
terraform apply
```

And to see logs

```bash
kubectl logs -f service/fittnessduel-service
```

And to destroy

```bash
terraform destroy
```
