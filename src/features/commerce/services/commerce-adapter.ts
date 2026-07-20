import type {
  AddCommerceShippingMethodInput,
  AddCommerceItemInput,
  CommerceCartEnvelope,
  CommerceCatalogEnvelope,
  CommerceOrderEnvelope,
  CommercePaymentProvidersEnvelope,
  CommercePaymentSessionsEnvelope,
  CommerceShippingOptionsEnvelope,
  CompleteCommerceCartInput,
  CreateCommercePaymentSessionsInput,
  CreateCommerceCartInput,
  UpdateCommerceItemInput,
} from '../server/commerce-gateway'

export interface CommerceAdapter {
  addItem(
    input: AddCommerceItemInput,
    cartId?: string,
  ): Promise<CommerceCartEnvelope>
  addShippingMethod(
    input: AddCommerceShippingMethodInput,
    cartId?: string,
  ): Promise<CommerceCartEnvelope>
  catalog(): Promise<CommerceCatalogEnvelope>
  completeCart(
    input?: CompleteCommerceCartInput,
    cartId?: string,
  ): Promise<CommerceOrderEnvelope>
  createCart(input?: CreateCommerceCartInput): Promise<CommerceCartEnvelope>
  createPaymentSessions(
    input: CreateCommercePaymentSessionsInput,
    cartId?: string,
  ): Promise<CommercePaymentSessionsEnvelope>
  getCart(cartId?: string): Promise<CommerceCartEnvelope>
  getPaymentProviders(
    cartId?: string,
  ): Promise<CommercePaymentProvidersEnvelope>
  getShippingOptions(cartId?: string): Promise<CommerceShippingOptionsEnvelope>
  removeItem(lineId: string, cartId?: string): Promise<CommerceCartEnvelope>
  updateCart(
    input: Record<string, unknown>,
    cartId?: string,
  ): Promise<CommerceCartEnvelope>
  updateItem(
    lineId: string,
    input: UpdateCommerceItemInput,
    cartId?: string,
  ): Promise<CommerceCartEnvelope>
}
