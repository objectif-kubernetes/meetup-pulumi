import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const ns = config.require("namespace");

const appLabels = { app: "nginx" };

// Création d'un Namespace Kubernetes en utilisant la classe Namespace de Pulumi
const namespace = new k8s.core.v1.Namespace("dev", {
	metadata: { name: ns },
});

// Création d'une ressource de déploiement Kubernetes en utilisant la classe Deployment de Pulumi
const deployment = new k8s.apps.v1.Deployment("nginx", {
	metadata: { namespace: ns },
	spec: {
		selector: { matchLabels: appLabels },
		replicas: 1,
		template: {
			metadata: { labels: appLabels },
			spec: { containers: [{ name: "nginx", image: config.require("image") }] },
		},
	},
});

// Export du nom du Namespace
export const name = pulumi.all([
	namespace.metadata.name,
	deployment.metadata.name,
]);
