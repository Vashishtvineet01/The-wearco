import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';

class BulkScreen extends ConsumerStatefulWidget {
  const BulkScreen({super.key});

  @override
  ConsumerState<BulkScreen> createState() => _BulkScreenState();
}

class _BulkScreenState extends ConsumerState<BulkScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _company = TextEditingController();
  final _qty = TextEditingController(text: '25');
  final _message = TextEditingController();

  bool _submitting = false;
  String? _error;
  bool _sent = false;

  @override
  void dispose() {
    for (final c in [_name, _email, _company, _qty, _message]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final dio = ref.read(dioProvider);
      await dio.post('/bulk/quote', data: {
        'email': _email.text.trim(),
        'name': _name.text.trim(),
        'company': _company.text.trim().isEmpty ? null : _company.text.trim(),
        'qty': int.tryParse(_qty.text.trim()) ?? 10,
        'message': _message.text.trim(),
      });
      setState(() => _sent = true);
    } on DioException catch (e) {
      setState(() => _error = ApiException.fromDioError(e).message);
    } catch (e) {
      setState(() => _error = 'Failed to send: $e');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_sent) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Bulk orders'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () =>
                context.canPop() ? context.pop() : context.go('/'),
          ),
        ),
        body: Center(
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
                  child: const Icon(Icons.check, color: AppColors.ink950, size: 28),
                ),
                const SizedBox(height: 14),
                Text('// Enquiry received',
                    style: Theme.of(context)
                        .textTheme
                        .labelMedium
                        ?.copyWith(color: AppColors.signalLime)),
                const SizedBox(height: 8),
                Text('Got it.',
                    style: Theme.of(context).textTheme.displayMedium),
                const SizedBox(height: 10),
                Text(
                  "We'll reply within 1 business day with a confirmed quote.",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => context.go('/'),
                  child: const Text('Back to shop'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bulk orders'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
          children: [
            Text('// Bulk orders',
                style: Theme.of(context)
                    .textTheme
                    .labelMedium
                    ?.copyWith(color: AppColors.signalLime)),
            const SizedBox(height: 6),
            Text('Kit out your team.',
                style: Theme.of(context).textTheme.displayMedium),
            const SizedBox(height: 10),
            Text(
              'Tees, hoodies, mugs, pins, posters — printed with your artwork. Volume pricing from 10 units, discounts up to 50%.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            _input(label: 'Full name', controller: _name, required: true),
            _input(
              label: 'Work email',
              controller: _email,
              required: true,
              keyboard: TextInputType.emailAddress,
            ),
            _input(label: 'Company (optional)', controller: _company),
            _input(
              label: 'Quantity',
              controller: _qty,
              required: true,
              keyboard: TextInputType.number,
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: TextFormField(
                controller: _message,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'Brief / message',
                  hintText:
                      'We\'re a 32-person team shipping v2 at TechSparks. Need chest + sleeve print on hoodies by Dec 20.',
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Message is required'
                    : null,
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!,
                  style: const TextStyle(color: AppColors.signalCoral)),
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
              child: Text(_submitting ? 'Sending…' : 'Send enquiry'),
            ),
          ),
        ),
      ),
    );
  }

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
}
