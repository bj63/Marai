class SupabaseChannel {
  constructor(name) {
    this.name = name;
  }

  on(event, filter, callback) {
    this._callback = callback;
    return this;
  }

  async subscribe() {
    return { data: { subscription: this }, error: null };
  }

  unsubscribe() {
    this._callback = undefined;
  }
}

class SupabaseQueryBuilder {
  constructor(table) {
    this.table = table;
  }

  select(columns) {
    return this;
  }

  insert(values) {
    return this;
  }

  update(values) {
    return this;
  }

  delete() {
    return this;
  }

  eq(column, value) {
    return this;
  }

  order(column, options) {
    return this;
  }

  limit(count) {
    return this;
  }

  async single() {
    return { data: null, error: null };
  }

  then(onfulfilled, onrejected) {
    // Mock response
    const response = { data: [], error: null };
    return Promise.resolve(response).then(onfulfilled, onrejected);
  }
}

class SupabaseAuthClient {
  async getSession() {
    return { data: { session: null }, error: null };
  }

  async signInWithPassword(credentials) {
    return { data: { session: null, user: null }, error: null };
  }

  async signUp(credentials) {
    return { data: { session: null, user: null }, error: null };
  }

  async signOut() {
    return { error: null };
  }
}

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.auth = new SupabaseAuthClient();
  }

  channel(name) {
    return new SupabaseChannel(name);
  }

  removeChannel(channel) {
    if (channel && typeof channel.unsubscribe === "function") {
      channel.unsubscribe();
    }
  }

  from(table) {
    return new SupabaseQueryBuilder(table);
  }
}

function createClient(url, key) {
  return new SupabaseClient(url, key);
}

module.exports = { createClient, SupabaseClient, SupabaseChannel };
