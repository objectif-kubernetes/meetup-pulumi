import * as pulumi from "@pulumi/pulumi";
import { Deployment } from "@pulumi/kubernetes/apps/v1";
import { Provider } from "@pulumi/kubernetes";
import { Service } from "@pulumi/kubernetes/core/v1";
import * as kubernetes from "@pulumi/kubernetes";

const config = new pulumi.Config();

const ns = config.require("nanespace");

// Récupération du nom du cluster K8S
const traefikReference = new pulumi.StackReference(
	"mikaelmorvan-meetup/pulumi-traefik/dev"
);

const provider = new Provider("provider", {
	cluster: traefikReference.requireOutput("clusterName"),
	namespace: ns,
});

const deploymentName = "whoami";

const whoamiDeployment = new Deployment(
	deploymentName,
	{
		spec: {
			selector: {
				matchLabels: {
					app: "whoami",
				},
			},
			replicas: parseInt(config.require("replicas")),
			template: {
				metadata: {
					labels: { app: "whoami" },
					name: deploymentName,
				},
				spec: {
					containers: [
						{
							name: "whoami",
							image: "traefik/whoami",
							imagePullPolicy: "Always",
						},
					],
				},
			},
		},
	},
	{
		provider: provider,
	}
);

// Crée un service pour le déploiement whoami
const whoamiService = new Service(
	"whoami-service",
	{
		metadata: {
			name: "whoami-service",
		},
		spec: {
			selector: whoamiDeployment.spec.template.metadata.labels,
			ports: [{ port: 80, targetPort: 80 }],
		},
	},
	{ provider: provider }
);

// Crée une route pour le service whoami
// C'est une custom resource Kubernetes de type IngressRoute
new kubernetes.apiextensions.CustomResource(
	`whoami-ingress-route`,
	{
		apiVersion: "traefik.containo.us/v1alpha1",
		kind: "IngressRoute",
		spec: {
			entryPoints: ["websecure"],
			routes: [
				{
					match: `Host(\`${config.require("domain-name")}\`)`,
					kind: "Rule",
					services: [
						{
							name: "whoami-service",
							port: 80,
						},
					],
				},
			],
			tls: {
				certResolver: "letsencrypt",
			},
		},
	},
	{ provider: provider, dependsOn: [whoamiService] }
);
