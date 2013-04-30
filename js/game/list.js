Game.List = Class.create({

  initialize: function(id) {
    this.id     = id || "list";
    this.length = 0;
    this.empty  = true;
    this._head  = null;
    this._tail  = null;
    this.pool   = [];
  },

  head: function()     { return this.empty ? null : this._head.data; },
  tail: function()     { return this.empty ? null : this._tail.data; },
  next: function(data) { var node = data[this.id]; return node.next ? node.next.data : null; },
  prev: function(data) { var node = data[this.id]; return node.prev ? node.prev.data : null; },

  append: function(data) {
    var node = (this.pool.length > 0) ? this.pool.pop() : { };
    if (this.empty) {
      this._head = this._tail = node;
      node.prev = node.next = null;
    }
    else {
      node.prev = this._tail;
      node.next = null;
      this._tail = this._tail.next = node;
    }
    node.data = data;
    data[this.id] = node;
    this.length++;
    this.empty = false;
  },

  remove: function(data) {
    var tmp, node = data[this.id];

    if (node === this._head) {
      this._head = this._head.next;
      if (this._head)
        this._head.prev = null;
    }
    else if (node === this._tail) {
      this._tail = this._tail.prev;
      this._tail.next = null;
    }
    else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    node.data = node.next = node.prev = null;
    data[this.id] = null;
    this.pool.push(node);
    this.length--;
    this.empty = (this.length === 0);
  },

  walk: function(cb) {
    var node = this._head;
    while (node) {
      cb(node.data);
      node = node.next;
    }
  }

});

