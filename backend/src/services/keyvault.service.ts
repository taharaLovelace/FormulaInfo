import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

export class KeyVaultService {
  private client: SecretClient | null = null;

  constructor(keyVaultUrl?: string) {
    if (keyVaultUrl) {
      const credential = new DefaultAzureCredential();
      this.client = new SecretClient(keyVaultUrl, credential);
    }
  }

  /**
   * Busca as credenciais do banco de dados no Azure Key Vault
   * e constrói a DATABASE_URL
   */
  async getDatabaseCredentials(): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    try {
      const [host, port, name, username, password] = await Promise.all([
        this.client.getSecret('database-host'),
        this.client.getSecret('database-port'), 
        this.client.getSecret('database-name'),
        this.client.getSecret('database-username'),
        this.client.getSecret('database-password')
      ]);

      if (!host.value || !port.value || !name.value || !username.value || !password.value) {
        throw new Error('Missing database credentials in Key Vault');
      }
      const dbCredentials = `postgresql://${username.value}:${password.value}@${host.value}:${port.value}/${name.value}?schema=public`;
      console.log(dbCredentials);
      return dbCredentials;
    } catch (error) {
      console.error('Error fetching database credentials from Key Vault:', error);
      return null;
    }
  }
}