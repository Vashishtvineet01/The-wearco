import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/models/cart_item.dart';

const _cartStorageKey = 'thewearco.cart.v1';

class CartState {
  const CartState({required this.items});
  final List<CartItem> items;

  int get count => items.fold(0, (s, i) => s + i.qty);
  int get subtotal => items.fold(0, (s, i) => s + i.lineTotal);

  CartState copyWith({List<CartItem>? items}) =>
      CartState(items: items ?? this.items);

  Map<String, dynamic> toJson() => {
        'items': items.map((e) => e.toJson()).toList(),
      };

  factory CartState.empty() => const CartState(items: []);

  factory CartState.fromJson(Map<String, dynamic> json) {
    final list = (json['items'] as List? ?? [])
        .map((e) => CartItem.fromJson((e as Map).cast<String, dynamic>()))
        .toList();
    return CartState(items: list);
  }
}

class CartController extends StateNotifier<CartState> {
  CartController() : super(CartState.empty()) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_cartStorageKey);
    if (raw == null) return;
    try {
      final json = jsonDecode(raw) as Map<String, dynamic>;
      state = CartState.fromJson(json);
    } catch (_) {
      // Ignore corrupted cart
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cartStorageKey, jsonEncode(state.toJson()));
  }

  /// Add a line. If the (slug, size, color) triple matches an existing line,
  /// bump the qty instead of adding a duplicate.
  void add(CartItem item) {
    final i = state.items.indexWhere(
      (x) => x.slug == item.slug && x.size == item.size && x.color == item.color,
    );
    final List<CartItem> next;
    if (i >= 0) {
      next = [...state.items];
      next[i] = next[i].copyWith(qty: next[i].qty + item.qty);
    } else {
      next = [...state.items, item];
    }
    state = state.copyWith(items: next);
    _persist();
  }

  void setQty(String id, int qty) {
    if (qty <= 0) {
      remove(id);
      return;
    }
    state = state.copyWith(
      items:
          state.items.map((i) => i.id == id ? i.copyWith(qty: qty) : i).toList(),
    );
    _persist();
  }

  void remove(String id) {
    state = state.copyWith(
      items: state.items.where((i) => i.id != id).toList(),
    );
    _persist();
  }

  void clear() {
    state = CartState.empty();
    _persist();
  }
}

final cartProvider = StateNotifierProvider<CartController, CartState>((ref) {
  return CartController();
});
