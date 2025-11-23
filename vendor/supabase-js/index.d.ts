export interface SupabaseChannel {
  on(event: string, filter: unknown, callback: (payload: any) => void): this;
  subscribe(): Promise<{ data: { subscription: SupabaseChannel }; error: null }>;
  unsubscribe(): void;
}

export interface SupabaseClient<Database = any> {
  channel(name: string): SupabaseChannel;
  removeChannel(channel: SupabaseChannel): void;
}

export function createClient<Database = any>(url: string, key: string): SupabaseClient<Database>;
