import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
import { load } from "js-yaml";
import { readFileSync } from "fs";
import { Output, interpolate } from "@pulumi/pulumi";
import { Service } from "@pulumi/kubernetes/core/v1/service";

// Emplacement du fichier de configuration Traefik
const TRAEFIK_CONF = "helm-values/traefik.default.yml";

export const createTraefik = (k8sProvider: kubernetes.Provider) => {
	const config = new pulumi.Config();
	const traefikNamespace = config.get("traefikNamespace") || "traefik";

	// Création d'un Namespace Kubernetes en utilisant la classe Namespace de Pulumi
	const traefikNs = new kubernetes.core.v1.Namespace(
		"traefikns",
		{
			metadata: {
				labels: { app: "traefik" },
				name: traefikNamespace,
			},
		},
		{ provider: k8sProvider }
	);

	// Création d'une ressource Helm en utilisant la classe HelmRelease de Pulumi
	// Le fichier de configuration Helm est chargé à partir du fichier TRAEFIK_CONF
	const traefikValues = load(
		readFileSync(TRAEFIK_CONF, { encoding: "utf-8" })
	) as Output<string>;

	const traefikHelm = new kubernetes.helm.v3.Release(
		"traefikhelm",
		{
			chart: "traefik",
			namespace: traefikNs.metadata.name,
			repositoryOpts: {
				repo: "https://helm.traefik.io/traefik",
			},
			values: traefikValues,
		},
		{
			provider: k8sProvider,
			dependsOn: [traefikNs], // Le déploiement Helm dépend du Namespace
			customTimeouts: { create: "5m" }, // On rajoute un timeout de 5 minutes pour que le loadbalancer soit créé
		}
	);

	// On doit attendre que le service soit créé pour obtenir l'adresse IP du LoadBalancer
	// On utilise la fonction apply pour obtenir le service créé
	const service = pulumi.all([traefikHelm.name, traefikHelm.id]).apply((e) => {
		const serviceName = `${e[0]}`;
		return Service.get(
			serviceName,
			interpolate`${traefikNs.metadata.name}/${serviceName}`,
			{
				provider: k8sProvider,
				dependsOn: [traefikNs],
			}
		);
	});

	const name = traefikHelm.name;
	return {
		gatewayIp: service.status.loadBalancer.ingress[0].ip,
		name,
	};
};
