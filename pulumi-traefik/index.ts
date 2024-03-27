import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";

import { createTraefik } from "./traefik";

const config = new pulumi.Config();

const provider = new kubernetes.Provider("provider", {
	cluster: config.require("k8sCluster"),
});

export const traefik = createTraefik(provider);
