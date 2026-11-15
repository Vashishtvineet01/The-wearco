class CreatedOrder {
  const CreatedOrder({
    required this.orderNumber,
    required this.orderId,
    required this.total,
  });

  final String orderNumber;
  final String orderId;
  final int total;

  factory CreatedOrder.fromJson(Map<String, dynamic> json) => CreatedOrder(
        orderNumber: json['orderNumber'] as String,
        orderId: json['orderId'] as String,
        total: (json['total'] as num).toInt(),
      );
}

/// Public-safe order view returned by `GET /orders/:orderNumber`.
/// Contains no PII — anyone with the order number can see this.
class OrderPublic {
  const OrderPublic({
    required this.orderNumber,
    required this.status,
    required this.subtotal,
    required this.shipping,
    required this.total,
    required this.paymentMethod,
    required this.createdAt,
    required this.items,
  });

  final String orderNumber;
  final String status;
  final int subtotal;
  final int shipping;
  final int total;
  final String paymentMethod;
  final DateTime createdAt;
  final List<OrderLineItem> items;

  factory OrderPublic.fromJson(Map<String, dynamic> json) {
    final itemsRaw = (json['items'] as List? ?? const []);
    return OrderPublic(
      orderNumber: json['orderNumber'] as String,
      status: (json['status'] as String?) ?? 'pending',
      subtotal: (json['subtotal'] as num?)?.toInt() ?? 0,
      shipping: (json['shipping'] as num?)?.toInt() ?? 0,
      total: (json['total'] as num?)?.toInt() ?? 0,
      paymentMethod: (json['paymentMethod'] as String?) ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      items: itemsRaw
          .map((e) =>
              OrderLineItem.fromJson((e as Map).cast<String, dynamic>()))
          .toList(),
    );
  }
}

class OrderLineItem {
  const OrderLineItem({
    required this.name,
    required this.price,
    required this.qty,
    this.size,
    this.color,
    this.productSlug,
  });

  final String name;
  final int price;
  final int qty;
  final String? size;
  final String? color;
  final String? productSlug;

  factory OrderLineItem.fromJson(Map<String, dynamic> json) => OrderLineItem(
        name: (json['name'] as String?) ?? 'Item',
        price: (json['price'] as num?)?.toInt() ?? 0,
        qty: (json['qty'] as num?)?.toInt() ?? 1,
        size: json['size'] as String?,
        color: json['color'] as String?,
        productSlug: json['productSlug'] as String?,
      );
}
