export interface SupabaseChannel {
  on(event: string, filter: unknown, callback: (payload: any) => void): this;
  subscribe(): Promise<{ data: { subscription: SupabaseChannel }; error: null }>;
  unsubscribe(): void;
}

export interface SupabaseQueryBuilder<T> {
  select(columns?: string): SupabaseQueryBuilder<T>;
  insert(values: any): SupabaseQueryBuilder<T>;
  update(values: any): SupabaseQueryBuilder<T>;
  delete(): SupabaseQueryBuilder<T>;
  eq(column: string, value: any): SupabaseQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): SupabaseQueryBuilder<T>;
  limit(count: number): SupabaseQueryBuilder<T>;
  single(): Promise<{ data: any; error: any }>;
  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2>;
}

export interface Session {
  user: {
    id: string;
    email?: string;
  };
  access_token: string;
}

export interface SupabaseAuthClient {
  getSession(): Promise<{ data: { session: Session | null }; error: any }>;
  signInWithPassword(credentials: any): Promise<{ data: { session: Session | null; user: any }; error: any }>;
  signUp(credentials: any): Promise<{ data: { session: Session | null; user: any }; error: any }>;
  signOut(): Promise<{ error: any }>;
}

export interface SupabaseClient<Database = any> {
  auth: SupabaseAuthClient;
  channel(name: string): SupabaseChannel;
  removeChannel(channel: SupabaseChannel): void;
  from(table: string): SupabaseQueryBuilder<any>;
}

export function createClient<Database = any>(url: string, key: string): SupabaseClient<Database>;
