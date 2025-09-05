# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Configuração base para todas as VMs
  config.vm.box = "ubuntu/jammy64"  # Ubuntu 22.04 LTS (mais estável)
  config.vm.box_check_update = false

  # Configurações do VirtualBox
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "2048"
    vb.cpus = 2
    vb.gui = false
  end

  # ============================
  # VM 1: PROXY (NGINX)
  # ============================
  config.vm.define "proxy" do |proxy|
    proxy.vm.hostname = "formula-proxy"
    
  # Interfaces de rede
  # 1) Interface NAT padrão (eth0) criada automaticamente pelo Vagrant -> acesso externo
  # 2) Interface host-only para comunicação interna entre as VMs (eth1)
  proxy.vm.network "private_network", ip: "192.168.56.10"
  # (Removido public_network/bridge para manter o setup o mais simples possível)
    
    # Pasta compartilhada
    proxy.vm.synced_folder "./nginx", "/vagrant/nginx"
    proxy.vm.synced_folder "./scripts", "/vagrant/scripts"
    
    # Configurações específicas
    proxy.vm.provider "virtualbox" do |vb|
      vb.name = "formula-proxy"
      vb.memory = "1024"
      vb.cpus = 1
    end
    
    # Script de provisionamento
    proxy.vm.provision "shell", path: "scripts/provision-proxy.sh"
  end

  # ============================
  # VM 2: DATABASE (PostgreSQL)
  # ============================
  config.vm.define "database" do |db|
    db.vm.hostname = "formula-db"
    
    # Interface de rede (host-only)
    db.vm.network "private_network", ip: "192.168.56.11"
    
    # Pasta compartilhada
    db.vm.synced_folder "./scripts", "/vagrant/scripts"
    
    # Configurações específicas
    db.vm.provider "virtualbox" do |vb|
      vb.name = "formula-database"
      vb.memory = "2048"
      vb.cpus = 2
      # Mantemos a interface NAT padrão durante o provisionamento para instalar pacotes.
      # O bloqueio de acesso externo é feito via UFW no script de provisionamento.
    end
    
    # Script de provisionamento
    db.vm.provision "shell", path: "scripts/provision-database.sh"
  end

  # ============================
  # VM 3: BACKEND (Node.js API)
  # ============================
  config.vm.define "backend" do |backend|
    backend.vm.hostname = "formula-backend"
    
    # Interface de rede (host-only)
    backend.vm.network "private_network", ip: "192.168.56.12"
    
    # Pasta compartilhada
    backend.vm.synced_folder "./backend", "/vagrant/backend"
    backend.vm.synced_folder "./scripts", "/vagrant/scripts"
    
    # Configurações específicas
    backend.vm.provider "virtualbox" do |vb|
      vb.name = "formula-backend"
      vb.memory = "2048"
      vb.cpus = 2
      # Mantemos NAT para provisioning; saída externa depois será bloqueada por firewall.
    end
    
    # Script de provisionamento
    backend.vm.provision "shell", path: "scripts/provision-backend.sh"
    
    # Script que roda a cada boot
    backend.vm.provision "shell", path: "scripts/startup-backend.sh", run: "always"
  end

  # ============================
  # VM 4: FRONTEND (Next.js)
  # ============================
  config.vm.define "frontend" do |frontend|
    frontend.vm.hostname = "formula-frontend"
    
    # Interface de rede (host-only)
    frontend.vm.network "private_network", ip: "192.168.56.13"
    
    # Pasta compartilhada
    frontend.vm.synced_folder "./frontend", "/vagrant/frontend"
    frontend.vm.synced_folder "./scripts", "/vagrant/scripts"
    
    # Configurações específicas
    frontend.vm.provider "virtualbox" do |vb|
      vb.name = "formula-frontend"
      vb.memory = "2048"
      vb.cpus = 2
      # Mantemos NAT para provisioning; saída externa depois será bloqueada por firewall.
    end
    
    # Script de provisionamento
    frontend.vm.provision "shell", path: "scripts/provision-frontend.sh"
    
    # Script que roda a cada boot
    frontend.vm.provision "shell", path: "scripts/startup-frontend.sh", run: "always"
  end
end
