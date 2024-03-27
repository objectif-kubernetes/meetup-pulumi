import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

import { createTraefik } from "./traefik";

const config = new pulumi.Config();

const provider = new k8s.Provider("provider", {
	cluster: config.require("k8sCluster"),
});

export const traefik = createTraefik(provider);

export const clusterName = config.require("k8sCluster");
