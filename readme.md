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


