#!/bin/bash

# Script de gerenciamento do ambiente Vagrant Formula Info

show_help() {
    echo "Formula Info - Gerenciador de Ambiente Vagrant"
    echo ""
    echo "Uso: $0 [COMANDO] [OPÇÕES]"
    echo ""
    echo "Comandos:"
    echo "  up [vm]       - Subir todas as VMs ou uma específica"
    echo "  down [vm]     - Parar todas as VMs ou uma específica"
    echo "  restart [vm]  - Reiniciar todas as VMs ou uma específica"
    echo "  status        - Mostrar status de todas as VMs"
    echo "  logs [vm]     - Mostrar logs de uma VM específica"
    echo "  ssh [vm]      - Conectar via SSH em uma VM"
    echo "  destroy       - Destruir todas as VMs"
    echo "  provision [vm] - Re-provisionar uma VM"
    echo "  start-dev     - Iniciar ambiente de desenvolvimento"
    echo "  help          - Mostrar esta ajuda"
    echo ""
    echo "VMs disponíveis: proxy, database, backend, frontend"
    echo ""
    echo "Exemplos:"
    echo "  $0 up                 # Subir todas as VMs"
    echo "  $0 up database        # Subir apenas o banco"
    echo "  $0 logs backend       # Ver logs do backend"
    echo "  $0 ssh frontend       # Conectar no frontend"
    echo "  $0 start-dev          # Iniciar em modo desenvolvimento"
}

VMS=("database" "backend" "frontend" "proxy")

case "$1" in
    "up")
        if [ -z "$2" ]; then
            echo "Subindo todas as VMs na ordem recomendada..."
            for vm in "${VMS[@]}"; do
                echo "Subindo $vm..."
                vagrant up $vm
                sleep 10
            done
        else
            echo "Subindo VM: $2"
            vagrant up $2
        fi
        ;;
    "down")
        if [ -z "$2" ]; then
            echo "Parando todas as VMs..."
            vagrant halt
        else
            echo "Parando VM: $2"
            vagrant halt $2
        fi
        ;;
    "restart")
        if [ -z "$2" ]; then
            echo "Reiniciando todas as VMs..."
            vagrant halt
            sleep 5
            for vm in "${VMS[@]}"; do
                echo "Subindo $vm..."
                vagrant up $vm
                sleep 10
            done
        else
            echo "Reiniciando VM: $2"
            vagrant halt $2
            sleep 5
            vagrant up $2
        fi
        ;;
    "status")
        echo "Status das VMs:"
        vagrant status
        ;;
    "logs")
        if [ -z "$2" ]; then
            echo "Especifique qual VM você quer ver os logs: proxy, database, backend, frontend"
            exit 1
        fi
        case "$2" in
            "proxy")
                vagrant ssh proxy -c "sudo tail -f /var/log/nginx/access.log"
                ;;
            "database")
                vagrant ssh database -c "sudo tail -f /var/log/postgresql/postgresql-16-main.log"
                ;;
            "backend")
                vagrant ssh backend -c "sudo journalctl -u formula-backend -f"
                ;;
            "frontend")
                vagrant ssh frontend -c "sudo journalctl -u formula-frontend -f"
                ;;
            *)
                echo "VM inválida. Use: proxy, database, backend, frontend"
                ;;
        esac
        ;;
    "ssh")
        if [ -z "$2" ]; then
            echo "Especifique qual VM você quer acessar: proxy, database, backend, frontend"
            exit 1
        fi
        vagrant ssh $2
        ;;
    "destroy")
        echo "ATENÇÃO: Isso irá destruir todas as VMs!"
        read -p "Tem certeza? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vagrant destroy -f
        fi
        ;;
    "provision")
        if [ -z "$2" ]; then
            echo "Re-provisionando todas as VMs..."
            vagrant provision
        else
            echo "Re-provisionando VM: $2"
            vagrant provision $2
        fi
        ;;
    "start-dev")
        echo "Iniciando ambiente de desenvolvimento..."
        echo "1. Subindo banco de dados..."
        vagrant up database
        sleep 30
        
        echo "2. Subindo backend..."
        vagrant up backend
        sleep 30
        
        echo "3. Subindo frontend..."
        vagrant up frontend
        sleep 30
        
        echo "4. Subindo proxy..."
        vagrant up proxy
        sleep 15
        
        echo ""
        echo "Ambiente pronto!"
        echo "Acesse: http://192.168.56.10"
        echo ""
        echo "Para monitorar:"
        echo "  Backend logs:  $0 logs backend"
        echo "  Frontend logs: $0 logs frontend"
        echo "  Proxy logs:    $0 logs proxy"
        ;;
    "help"|""|*)
        show_help
        ;;
esac
