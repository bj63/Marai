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

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  channel(name) {
    return new SupabaseChannel(name);
  }

  removeChannel(channel) {
    if (channel && typeof channel.unsubscribe === "function") {
      channel.unsubscribe();
    }
  }
}

function createClient(url, key) {
  return new SupabaseClient(url, key);
}

module.exports = { createClient, SupabaseClient, SupabaseChannel };
