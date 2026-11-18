import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../cart/cart_controller.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _line1 = TextEditingController();
  final _line2 = TextEditingController();
  final _city = TextEditingController();
  final _state = TextEditingController();
  final _pincode = TextEditingController();
  String _payment = 'upi';
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    for (final c in [
      _name,
      _email,
      _phone,
      _line1,
      _line2,
      _city,
      _state,
      _pincode,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    final cart = ref.read(cartProvider);
    if (cart.items.isEmpty) {
      setState(() => _error = 'Cart is empty.');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final api = ref.read(orderApiProvider);
      final order = await api.placeOrder(
        email: _email.text.trim(),
        name: _name.text.trim(),
        phone: _phone.text.trim(),
        paymentMethod: _payment,
        address: {
          'line1': _line1.text.trim(),
          'line2': _line2.text.trim(),
          'city': _city.text.trim(),
          'state': _state.text.trim(),
          'pincode': _pincode.text.trim(),
          'country': 'India',
        },
        items: cart.items,
      );
      ref.read(cartProvider.notifier).clear();
      if (!mounted) return;
      context.go('/checkout/success?order=${order.orderNumber}');
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error =
          "We couldn't place your order. Check your connection and try again.");
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final shipping = cart.subtotal == 0
        ? 0
        : (cart.subtotal >= 1499 ? 0 : 99);
    final total = cart.subtotal + shipping + (_payment == 'cod' ? 49 : 0);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
          children: [
            _label('01 · Contact'),
            _input(label: 'Full name', controller: _name, required: true),
            _input(
              label: 'Email',
              controller: _email,
              required: true,
              keyboard: TextInputType.emailAddress,
            ),
            _input(
              label: 'Phone',
              controller: _phone,
              required: true,
              keyboard: TextInputType.phone,
            ),
            const SizedBox(height: 24),
            _label('02 · Ship to'),
            _input(label: 'Address line 1', controller: _line1, required: true),
            _input(label: 'Address line 2', controller: _line2),
            _input(label: 'City', controller: _city, required: true),
            _input(label: 'State', controller: _state, required: true),
            _input(
              label: 'Pincode',
              controller: _pincode,
              required: true,
              keyboard: TextInputType.number,
            ),
            const SizedBox(height: 24),
            _label('03 · Payment'),
            _paymentTile('upi', 'UPI', 'Pay with Google Pay / PhonePe'),
            _paymentTile('card', 'Card', 'Visa, Mastercard, Rupay'),
            _paymentTile('cod', 'Cash on Delivery', '+ ₹49 handling fee'),
            const SizedBox(height: 24),
            _label('Summary'),
            const SizedBox(height: 10),
            _summaryRow('Subtotal', formatInr(cart.subtotal)),
            _summaryRow(
              'Shipping',
              shipping == 0 ? 'Free' : formatInr(shipping),
            ),
            if (_payment == 'cod')
              _summaryRow('COD fee', formatInr(49)),
            const SizedBox(height: 8),
            Divider(color: Colors.white.withValues(alpha: 0.06), height: 1),
            const SizedBox(height: 10),
            Row(
              children: [
                Text('Total', style: Theme.of(context).textTheme.titleLarge),
                const Spacer(),
                Text(
                  formatInr(total),
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(fontSize: 22),
                ),
              ],
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: AppColors.signalCoral)),
            ],
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: _submitting ? null : _submit,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text(
                _submitting
                    ? 'Placing order…'
                    : 'Place order — ${formatInr(total)}',
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _label(String s) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(s, style: Theme.of(context).textTheme.labelMedium),
      );

  Widget _input({
    required String label,
    required TextEditingController controller,
    bool required = false,
    TextInputType keyboard = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboard,
        decoration: InputDecoration(labelText: label),
        validator: required
            ? (v) => (v == null || v.trim().isEmpty)
                ? '$label is required'
                : null
            : null,
      ),
    );
  }

  Widget _paymentTile(String id, String label, String sub) {
    final active = _payment == id;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => setState(() => _payment = id),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: active
                ? AppColors.signalLime.withValues(alpha: 0.08)
                : Colors.white.withValues(alpha: 0.03),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: active
                  ? AppColors.signalLime
                  : Colors.white.withValues(alpha: 0.08),
            ),
          ),
          child: Row(
            children: [
              Radio<String>(
                value: id,
                groupValue: _payment,
                onChanged: (v) => setState(() => _payment = v!),
                fillColor: WidgetStateProperty.all(AppColors.signalLime),
              ),
              const SizedBox(width: 4),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: Theme.of(context).textTheme.titleMedium),
                  Text(sub, style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _summaryRow(String a, String b) {
    final s = Theme.of(context).textTheme.bodyMedium;
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Text(a, style: s),
          const Spacer(),
          Text(b, style: s),
        ],
      ),
    );
  }
}

class CheckoutSuccessScreen extends StatelessWidget {
  const CheckoutSuccessScreen({super.key, required this.orderNumber});
  final String orderNumber;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: const BoxDecoration(
                    color: AppColors.signalLime,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check,
                      color: AppColors.ink950, size: 28),
                ),
                const SizedBox(height: 14),
                Text('// Order confirmed',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: AppColors.paper700,
                          fontWeight: FontWeight.w700,
                        )),
                const SizedBox(height: 8),
                Text('You\'re shipping',
                    style: Theme.of(context).textTheme.displayMedium),
                const SizedBox(height: 10),
                Text(
                  'Custom prints typically ship in 5–7 working days.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.08)),
                    borderRadius: BorderRadius.circular(999),
                    color: Colors.black.withValues(alpha: 0.3),
                  ),
                  child: Text(
                    orderNumber,
                    style: const TextStyle(
                      fontFamily: 'Source Code Pro',
                      color: AppColors.ink50,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => context.go('/'),
                  child: const Text('Continue'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
