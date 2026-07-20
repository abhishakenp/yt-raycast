import type {
  AddCommerceItemInput,
  CommerceCartEnvelope,
  CommerceCatalogEnvelope,
  CreateCommerceCartInput,
  UpdateCommerceItemInput,
} from '../server/commerce-gateway'

export interface CommerceAdapter {
  addItem(
    input: AddCommerceItemInput,
    cartId?: string,
  ): Promise<CommerceCartEnvelope>
  catalog(): Promise<CommerceCatalogEnvelope>
  createCart(input?: CreateCommerceCartInput): Promise<CommerceCartEnvelope>
  getCart(cartId?: string): Promise<CommerceCartEnvelope>
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
