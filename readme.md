# Introduction

Ce projet est un support pour le meetup du 28 mars 2024 sur le thème de Pulumi.
Les slides de la présentation seront disponibles dans le dossier `slides`.
Une capture vidéo de la présentation sera disponible sur Youtube.

# Installation

Afin de pouvoir exécuter les exemples de code, vous devez installer Pulumi sur votre machine. Pour le détail de l'installation, merci de se reporter au site de [Pulumi](https://www.pulumi.com/docs/install/)

Pour installer la CLI de Pulumi sur un Mac, vous pouvez utiliser Homebrew :
```bash
brew install pulumi
```

Vous devez également créer un compte gratuit sur le site de Pulumi pour pouvoir exécuter les exemples de code. Une fois le compte créé, vous devez vous connecter à votre compte via la CLI :
```bash
pulumi login
```

et suivre les instructions.

Pous savoir si vous êtes bien connecté, vous pouvez exécuter la commande suivante :
```bash
pulumi whoami -v
```

et vous devriez voir votre nom d'utilisateur s'afficher.

# Démonstration

Le projet de démonstration va déployer une application web sur un cluster K8S. Pour la démonstration, j'ai utilisé un cluster K8S chez Scaleway qui me coûte 0,01€ par heure. Vous pouvez utiliser un autre fournisseur de cloud si vous le souhaitez.

Vérifiez bien que vous avez accès à ce cluster en effectuant la commande suivante :
```bash
kubectl get nodes
```

## Crétation d'un premier projet

Je vais utiliser le langage TypeScript pour ce projet, mais vous pouvez utiliser un autre langage si vous le souhaitez. Bien entendu, vous devez avoir les dépendances nécessaires pour le langage que vous choisissez. Pour ma part, j'ai installé Node.js sur ma machine.

Le premier projet va permettre de tester le déploiement d'une simple application web sur un cluster K8S. Pour se faire on va utiliser un template de projet Pulumi.


Créez un nouveau répertoire pour le projet :
```bash
mkdir pulumi-web
cd pulumi-web
```

Initialisez le projet Pulumi :
```bash
pulumi new kubernetes-typescript
```

Suivez les instructions pour créer le projet.

Pour déployer le projet, exécutez la commande suivante :
```bash
pulumi up
```

Une fois le projet déployé, vous pouvez constater que votre application web Nginx est déployée sur votre cluster K8S.

Si vous regardez dans votre dashboard Pulumi, vous verez que le projet est bien déployé et que l'état du déploiement est enregistré.


Pour supprimer le déploiement, exécutez la commande suivante :
```bash
pulumi down
```

Vous pouvez constater que le déploiement a bien été supprimé et que l'application web n'est plus disponible sur le cluster K8S.


## Regardons le code

Le code du projet est disponible dans le répertoire `pulumi-web`. Vous pouvez regarder le code pour comprendre comment Pulumi fonctionne.

Le fichier `package.json` contient les dépendances du projet. Vous pouvez ajouter des dépendances si vous en avez besoin.

```json
{
    "name": "pulumi-web",
    "main": "index.ts",
    "devDependencies": {
        "@types/node": "^18"
    },
    "dependencies": {
        "@pulumi/pulumi": "^3.0.0",
        "@pulumi/kubernetes": "^4.0.0"
    }
}
```

Pour ceux qui ne sont pas familier avec Typescript, le fichier `package.json` contient les dépendances du projet. Vous pouvez ajouter des dépendances si vous en avez besoin. Ici, nous avons ajouté les dépendances pour Pulumi et Kubernetes.

Le fichier `Pulumi.yaml` contient les informations du projet comme le nom, le runtime, la description et les tags. Ce fichier est utilisé par Pulumi pour identifier le projet.

```yaml
name: pulumi-web
runtime: nodejs
description: A minimal Kubernetes TypeScript Pulumi program
config:
  pulumi:tags:
    value:
      pulumi:template: kubernetes-typescript
```


Le fichier `index.ts` contient le code du projet. Vous pouvez ajouter des ressources Kubernetes en utilisant les classes de Pulumi.

```typescript
import * as k8s from "@pulumi/kubernetes";

// Définition des labels pour le déploiement
const appLabels = { app: "nginx" };

// Création d'une ressource de déploiement Kubernetes en utilisant la classe Deployment de Pulumi
const deployment = new k8s.apps.v1.Deployment("nginx", {
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: "nginx", image: "nginx" }] }
        }
    }
});

// Export du nom du déploiement
// Vous pouvez utiliser ce nom pour référencer le déploiement dans d'autres ressources Kubernetes
// Vous retrouverez ce nom dans le dashboard Pulumi ainsi que dans le Output de la commande pulumi up
export const name = deployment.metadata.name;
````

Le code ci-dessus crée un déploiement Kubernetes avec une réplication de 1 et un conteneur Nginx. Vous pouvez ajouter d'autres ressources Kubernetes en utilisant les classes de Pulumi.

## Comment paramétrer le projet ?

Vous pouvez paramétrer le projet en utilisant les variables de configuration de Pulumi. Pour ce faire, vous pouvez utiliser la ligne de commande :
    
```bash
pulumi config set pulumi-web:replicas 3
pulumi config set pulumi-web:image nginx:alpine
```

Les commandes suivantes vont générer un fichier `Pulumi.dev.yaml` dans le répertoire du projet avec les valeurs des variables de configuration.

```yaml
config:
  pulumi-web:image: nginx:alpine
  pulumi-web:replicas: "3"
```

Ce fichier est lu par Pulumi lors de l'exécution du projet pour la `Stack` de développement.

## Définition d'une Stack pour Pulumi

Pulumi utilise des `Stacks` pour gérer les environnements de déploiement. Vous pouvez définir une `Stack` pour chaque environnement de déploiement (dev, staging, prod, etc.).

Pour créer une `Stack`, vous pouvez utiliser la commande suivante :
```bash
pulumi stack init prod
```

Cette commande va créer un stack de Production. De la même manière que pour la Stack de développement, vous pouvez paramétrer la Stack de Production en utilisant la ligne de commande de Pulumi.

```bash
pulumi config set pulumi-web:replicas 3
pulumi config set pulumi-web:image nginx:alpine
```

Pour lister les `Stacks` disponibles, vous pouvez utiliser la commande suivante :
```bash
pulumi stack ls
```

Pour basculer d'une `Stack` à une autre, vous pouvez utiliser la commande suivante :
```bash
pulumi stack select prod
```

## Définition d'un secret pour Pulumi

Pulumi vous permet de stocker des secrets en toute sécurité en utilisant [les secrets de Pulumi](https://www.pulumi.com/blog/managing-secrets-with-pulumi/). 

Pour la faire courte, Pulumi gère la clef de chiffrement pour vous. Mais vous pouvez également utiliser votre propre clef de chiffrement en utilisant des secrets managés (chez AWS, Azure, GCP, etc.) ou bien en utilisant la variable d'envirronement `PULUMI_CONFIG_PASSPHRASE`.

Pour définir un secret, vous pouvez utiliser la commande suivante :
```bash
pulumi config set --secret pulumi-web:password mypassword
```

Cette commande va stocker le secret `mypassword` dans le fichier `Pulumi.dev.yaml` de la Stack de développement. Vous pouvez stocker des secrets pour chaque `Stack` que vous avez défini.


Pour récupérer la valeur du secret, vous pouvez utiliser la commande suivante :
```bash
pulumi config get pulumi-web:password
```

## Gestion des environnements

Nous avons vu que Pulumi gère les environnements de déploiement en utilisant les `Stacks`. Nous allons déployer notre application web sur un cluster K8S en utilisant différentes `Stacks` pour chaque environnement. Et pour Kubernetes, nous allons utiliser des `Namespaces` pour isoler les ressources de chaque environnement.

Pour créer un `Namespace` Kubernetes, vous pouvez utiliser le code suivant :

```typescript
import * as k8s from "@pulumi/kubernetes";

// Création d'un Namespace Kubernetes en utilisant la classe Namespace de Pulumi
const namespace = new k8s.core.v1.Namespace("dev", {
    metadata: { name: "dev" }
});

// Export du nom du Namespace
export const name = namespace.metadata.name;
```

C'est super simple et rapide mais comment on fait pour déployer notre application web dans ce `Namespace` ? Pour cela, vous pouvez utiliser le code suivant :

```typescript
import * as k8s from "@pulumi/kubernetes";

// Création d'une ressource de déploiement Kubernetes en utilisant la classe Deployment de Pulumi
const deployment = new k8s.apps.v1.Deployment("nginx", {
    metadata: { namespace: "dev" },
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: "nginx", image: "nginx" }] }
        }
    }
});
```

Super simple n'est-ce pas ?

En fait il y a un piège car si vous exécutez le code ci-dessus, vous allez obtenir une erreur car le `Namespace` n'est pas encore créé. Pour résoudre ce problème, vous pouvez utiliser les `Dependencies` de Pulumi.

```typescript   
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// Création d'un Namespace Kubernetes en utilisant la classe Namespace de Pulumi
const namespace = new k8s.core.v1.Namespace("dev", {
    metadata: { name: "dev" }
});

// Création d'une ressource de déploiement Kubernetes en utilisant la classe Deployment de Pulumi
const deployment = new k8s.apps.v1.Deployment("nginx", {
    metadata: { namespace: "dev" },
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: "nginx", image: "nginx" }] }
        }
    }
});

// Export du nom du Namespace
export const name = pulumi.all([
	namespace.metadata.name,
	deployment.metadata.name,
]);
```

En utilisant `pulumi.all`, vous pouvez définir une dépendance entre les ressources. Pulumi va créer les ressources dans l'ordre que vous avez défini.

Pour revenir à la gestion des environnements, nous allons utiliser la configuration de Pulumi pour définir le nom du namespace de déploiement. Pour ce faire, vous pouvez utiliser la commande suivante :

```bash
pulumi stack select dev
pulumi config set pulumi-web:namespace dev
pulumi stack select prod
pulumi config set pulumi-web:namespace prod
```

Ensuite, vous pouvez utiliser la configuration pour définir le namespace de déploiement dans le code :

```typescript
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const ns = config.require("namespace");
```

Mettons à jour notre code et lançons le déploiement des deux environnements :

```bash
pulumi stack select dev
pulumi up --yes
pulumi stack select prod
pulumi up --yes
```

nb: le flag `--yes` permet de ne pas demander de confirmation pour le déploiement.

Vous pouvez constater que les deux environnements sont déployés sur le cluster K8S et que les ressources sont isolées dans des namespaces différents.

## Pulumi et la gestion multi-projets

Quand un projet grandit et que vous avez plusieurs fonctionnalités différentes à gérer (par exemple, une application web, une application mobile, une API, etc.), vous pouvez utiliser la gestion multi-projets de Pulumi. Pulumi appelle cela des [micro-stacks](https://www.pulumi.com/docs/using-pulumi/organizing-projects-stacks/).

Pour ma part, j'utilise les micro-stacks pour séparer la partie infrastructure de mes projets de la partie applicative. Cela me permet de gérer les ressources d'infrastructure de manière indépendante de l'application.
La séparation que je fais entre la partie infrastructure et la partie applicative est basée sur le cycle de vie des différents composants. Les ressources d'infrastructure ont un cycle de vie plus long que les ressources applicatives. Par exemple, un cluster K8S peut être utilisé par plusieurs applications, donc il a un cycle de vie plus long que les applications qui tournent sur ce cluster.

Le problème de la gestion multi-projets est que Pulumi isole les projets entre eux. Cela signifie que vous ne pouvez pas partager des ressources entre les projets. Pour résoudre ce problème, vous pouvez utiliser les `StackReferences` de Pulumi.

Les `StackReferences` vous permettent de référencer des ressources d'un projet à un autre. Vous pouvez utiliser les `StackReferences` pour partager des ressources entre les projets.

Pour créer un `StackReference`, vous pouvez utiliser le code suivant :

```typescript
import * as pulumi from "@pulumi/pulumi";

const infra = new pulumi.StackReference("infra");
```
Grace aux StackRefences, vous pouvez avoir accès à toutes les ressources (en output) du projet `infra` dans le projet courant.

## Exemple: déploiement de Traefik sur un cluster K8S

Pour l'exemple, je vais déployer Traefik sur un cluster K8S en utilisant Pulumi. Traefik est un reverse proxy et un load balancer qui peut être utilisé pour gérer le trafic réseau sur un cluster K8S.

Pour ce faire, je vais créer un nouveau projet Pulumi et initialiser le projet avec le template Kubernetes TypeScript.

```bash
mkdir pulumi-traefik
cd pulumi-traefik
pulumi new kubernetes-typescript
```

Traefik sera utilisé au niveau cluster et non au niveau namespace. Je considère que Traefik fera partie de mes ressources d'infrastructure et sera utilisé par plusieurs applications.

Pour déployer Traefik, je vais utiliser le chart Helm de Traefik.

```typescript
const traefikHelm = new k8s.helm.v3.Release(
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
```

J'utilise un fichier de configuration sité dans le répertoire `helm-values` pour définir les valeurs du chart Helm de Traefik. Je vous laisse vous reporter au contenu du fichier et à l'aide de Traefik pour comprendre les valeurs.

Le code est très simple à comprendre à part la partie d'attente de la création du loadbalancer. En effet, le loadbalancer de Traefik peut prendre un certain temps à être créé. Pour cela, j'ai ajouté un timeout de 5 minutes pour attendre la création du loadbalancer.

Et pour récupérer l'adresse IP de sortie de notre loadbalancer, je vais utiliser la sortie de Pulumi.

```typescript
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

```

Dans le fichier `index.ts`, j'ai ajouté une sortie pour récupérer le nom du cluster K8S et l'adresse IP du loadbalancer. Ces sorties serviront à configurer les applications qui tourneront sur le cluster.

et bien sûr on déploie le projet :

```bash
pulumi up
```

Et voilà, Traefik est déployé sur le cluster K8S et vous avez l'adresse IP du loadbalancer.

## Exemple: déploiement d'une application web sur un cluster K8S

Pour l'exemple, je vais déployer une application web sur un cluster K8S en utilisant Pulumi. L'application web sera un simple serveur whoami qui renvoie des informations sur le serveur. J'ai fait pointer les noms de domaine de l'application web (prod et dev) sur le loadbalancer de Traefik.

Pour ce faire, je vais créer un nouveau projet Pulumi et initialiser le projet avec le template Kubernetes TypeScript.

```bash
mkdir pulumi-app
cd pulumi-app
pulumi new kubernetes-typescript
```

Plusieurs choses à remarquer dans ce nouveau projet

### Les StackReferences

J'utilise les `StackReferences` pour référencer les ressources de mon projet Traefik. Cela me permet de récupérer le nom du cluster K8S et l'adresse IP du loadbalancer pour configurer mon application web.

```typescript
// Récupération du nom du cluster K8S
const traefikReference = new pulumi.StackReference(
	"mikaelmorvan-meetup/pulumi-traefik/dev"
);
```

Le nom de la `StackReference` est `mikaelmorvan-meetup/pulumi-traefik/dev`. Cela signifie que je fais référence au projet `pulumi-traefik` de la Stack `dev` pour le user `mikaelmorvan-meetup`. Il n'y a à ma connaissance pas moyen de lister les `StackReferences` disponibles. Il faut donc connaître le nom de la `StackReference` pour l'utiliser.

### La notions de dependOn

J'utilise la notion de `dependOn` pour définir une dépendance entre les ressources. Cela permet de définir l'ordre de création des ressources.

```typescript
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
```

Dans le code ci-dessus, je crée un service pour le déploiement whoami et une route pour le service whoami. La route est une custom resource Kubernetes de type IngressRoute. La route dépend du service whoami pour être créée.

J'ai créé deux environnements pour le projet `pulumi-app` : `dev` et `prod`. 
J'ai créé trois variables pour chaque environnement : `domain-name`, `replicas` et `namespace`. Ces variables sont utilisées pour configurer l'application web et notamment pour définir le nom de domaine, le nombre de réplicas et le namespace de déploiement.

J'ai déployé l'application web sur les deux environnements.

```bash
pulumi stack select dev
pulumi up --yes
pulumi stack select prod
pulumi up --yes
```

Et voilà, l'application web est déployée sur le cluster K8S et vous pouvez y accéder via le nom de domaine que vous avez défini.

## Conclusion

En quelques lignes de code, nous avons déployé une application sur deux environnements différents. Nous avons une application web qui tourne sur un cluster K8S et qui est accessible via un loadbalancer. Nous avons utilisé Pulumi pour gérer l'infrastructure en tant que code et pour déployer les ressources sur le cluster K8S.

Pulumi est un outil puissant pour gérer l'infrastructure en tant que code. Il permet de déployer des ressources sur différents fournisseurs de cloud en utilisant un seul langage de programmation. Pulumi est facile à prendre en main et permet de gérer les environnements de déploiement de manière efficace.

Ce que je n'ai pas abordé dans ce meetup, c'est la notion de droits d'accès et de sécurité. Pulumi permet de gérer les droits d'accès et les secrets de manière sécurisée. Vous pouvez définir des rôles d'accès pour les utilisateurs et les groupes.

Une nouveauté de Pulumi que je n'ai pas abordée également est la partie ESC (Environments, Secrets, and Configuration). Pulumi a introduit une nouvelle fonctionnalité qui permet de gérer les environnements, les secrets et la configuration de manière plus efficace. Vous pouvez définir des environnements de déploiement, des secrets et des configurations pour chaque environnement.

