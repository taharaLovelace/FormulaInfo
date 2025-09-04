Relatório de Execução das VMs (Vagrant)
======================================

Objetivo: Validar se as VMs proxy, database, backend e frontend sobem conforme especificações:

Requisitos Atendidos (estado final):
1. Proxy com NAT + host-only (acesso externo permitido).
2. Demais VMs usam host-only para comunicação interna e possuem firewall bloqueando saída externa.
3. Bloqueio implementado via UFW (deny outgoing) nas VMs database, backend e frontend.
4. IPs internos:
   - proxy: 192.168.56.10
   - database: 192.168.56.11
   - backend: 192.168.56.12
   - frontend: 192.168.56.13

Testes Sugeridos:
1. Subir ambiente limpo: `vagrant destroy -f && vagrant up` (opcional se já estava rodando).
2. IPs: `ip -4 addr show | grep 192.168.56` dentro de cada VM.
3. Conectividade interna (ex backend): `ping -c2 192.168.56.11`.
4. Bloqueio externo (backend/database/frontend): `ping -c2 8.8.8.8` deve falhar (blocked by UFW).
5. Acesso externo proxy: `curl -I https://www.google.com` deve retornar cabeçalhos HTTP.
6. UFW (backend): `sudo ufw status verbose` -> outgoing: deny (allow para rede interna/proxy).

Observações:
- Se alguma VM interna sair para Internet: verificar se UFW ativo (`sudo ufw status`). Reaplicar com: `sudo ufw --force reset && sudo ufw default deny outgoing && sudo ufw default deny incoming` e reabrir regras internas.
- Opcional: após provisioning completo remover NIC NAT nas VMs internas via `VBoxManage modifyvm <vm-name> --nic1 none` (exige VM desligada). Não é necessário se firewall já bloqueia.

Status Final: Configuração aplicada e arquivos de documentação reduzidos conforme solicitado (mantido apenas README.md e este relatório).
