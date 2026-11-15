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
