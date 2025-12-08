#!/bin/bash

# Usage: ./run-github-actions.sh [options]

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== GitHub Actions Local Runner ===${NC}\n"

# Vérifier que Docker Compose est installé
if ! command -v docker compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose n'est pas installé!${NC}"
    exit 1
fi

# Démarrer le service si nécessaire
echo -e "${GREEN}Démarrage du service github-actions...${NC}"
docker compose up -d github-actions

# Installer act dans le conteneur si ce n'est pas déjà fait
echo -e "${GREEN}Installation de act...${NC}"
docker compose exec github-actions bash -c "
    if ! command -v act &> /dev/null; then
        curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
        mv bin/act /usr/local/bin/
    fi
"

# Afficher le menu
echo -e "\n${BLUE}Que voulez-vous exécuter ?${NC}"
echo "1) Lister tous les workflows"
echo "2) Exécuter le workflow 'quill-bundle' (quality job) - sortie filtrée"
echo "3) Exécuter le workflow 'quill-bundle' (security job) - sortie filtrée"
echo "4) Exécuter le workflow 'test-bundle-install' - sortie filtrée"
echo "5) Exécuter tous les workflows (pull_request) - sortie filtrée"
echo "6) Exécuter avec sortie complète (verbose)"
echo "7) Mode interactif (bash dans le conteneur)"
echo ""

read -p "Votre choix (1-7): " choice

case $choice in
    1)
        echo -e "\n${GREEN}Liste des workflows:${NC}"
        docker compose exec github-actions act -l
        ;;
    2)
        echo -e "\n${GREEN}Exécution du job 'quality'...${NC}"
        docker compose exec github-actions bash -c 'act pull_request -j quality --bind -s GITHUB_TOKEN="$GITHUB_TOKEN"'
        ;;
    3)
        echo -e "\n${GREEN}Exécution du job 'security'...${NC}"
        docker compose exec github-actions bash -c 'act pull_request -j security --bind -s GITHUB_TOKEN="$GITHUB_TOKEN"'
        ;;
    4)
        echo -e "\n${GREEN}Exécution du workflow 'test-bundle-install'...${NC}"
        docker compose exec github-actions bash -c 'act pull_request -j test_bundle_install --bind -s GITHUB_TOKEN="$GITHUB_TOKEN"'
        ;;
    5)
        echo -e "\n${GREEN}Exécution de tous les workflows pull_request...${NC}"
        docker compose exec github-actions bash -c 'act pull_request --bind -s GITHUB_TOKEN="$GITHUB_TOKEN"'
        ;;
    6)
        echo -e "\n${BLUE}Choisissez le job à exécuter en mode verbose:${NC}"
        echo "a) quality"
        echo "b) security"
        echo "c) test_bundle_install"
        echo "d) tous les workflows"
        read -p "Votre choix (a-d): " verbose_choice

        case $verbose_choice in
            a)
                echo -e "\n${GREEN}Exécution du job 'quality' (verbose)...${NC}"
                docker compose exec github-actions bash -c 'act pull_request -j quality --bind -s GITHUB_TOKEN="$GITHUB_TOKEN" --verbose'
                ;;
            b)
                echo -e "\n${GREEN}Exécution du job 'security' (verbose)...${NC}"
                docker compose exec github-actions bash -c 'act pull_request -j security --bind -s GITHUB_TOKEN="$GITHUB_TOKEN" --verbose'
                ;;
            c)
                echo -e "\n${GREEN}Exécution du job 'test_bundle_install' (verbose)...${NC}"
                docker compose exec github-actions bash -c 'act pull_request -j test_bundle_install --bind -s GITHUB_TOKEN="$GITHUB_TOKEN" --verbose'
                ;;
            d)
                echo -e "\n${GREEN}Exécution de tous les workflows (verbose)...${NC}"
                docker compose exec github-actions bash -c 'act pull_request --bind -s GITHUB_TOKEN="$GITHUB_TOKEN" --verbose'
                ;;
            *)
                echo -e "${YELLOW}Choix invalide!${NC}"
                exit 1
                ;;
        esac
        ;;
    7)
        echo -e "\n${GREEN}Mode interactif - tapez 'exit' pour sortir${NC}"
        echo -e "${YELLOW}Commandes disponibles:${NC}"
        echo "  act -l                                                    # Lister les workflows"
        echo "  act pull_request -s GITHUB_TOKEN=\$GITHUB_TOKEN --quiet   # Exécuter (sortie filtrée)"
        echo "  act -j quality --bind -s GITHUB_TOKEN=\$GITHUB_TOKEN      # Job spécifique"
        echo "  act -n                                                    # Dry run"
        echo ""
        docker compose exec github-actions bash
        ;;
    *)
        echo -e "${YELLOW}Choix invalide!${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Terminé!${NC}"
