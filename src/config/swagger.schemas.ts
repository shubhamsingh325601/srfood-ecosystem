/**
 * Reusable OpenAPI `components.schemas` / `components.responses` referenced by every
 * `@openapi` JSDoc block under `src/modules/**\/*.routes.ts` (see swagger.ts, which merges
 * this into the base definition passed to swagger-jsdoc).
 *
 * Kept hand-written (not generated from the Zod DTOs/Mongoose models) because swagger-jsdoc
 * has no Zod/Mongoose introspection — CLAUDE.md §12/§6 mandates swagger-jsdoc annotations as
 * the documentation mechanism, so this is the one place that shape is transcribed for the
 * `/api/docs` UI. Keep in sync with the corresponding `*.model.ts` / `*.dto.ts` when they change.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Schema = Record<string, any>;

const objectId = (description?: string): Schema => ({
  type: 'string',
  pattern: '^[a-f0-9]{24}$',
  example: '64f1a2b3c4d5e6f7a8b9c0d1',
  ...(description ? { description } : {}),
});

const dateTime = (description?: string): Schema => ({
  type: 'string',
  format: 'date-time',
  ...(description ? { description } : {}),
});

const paise = (description?: string): Schema => ({
  type: 'integer',
  description: description ? `${description} (integer paise; ₹ = value / 100)` : 'Integer paise; ₹ = value / 100',
  example: 25000,
});

const success = (data: Schema): Schema => ({
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', example: true },
    data,
    message: { type: 'string' },
  },
});

const successArray = (items: Schema): Schema => success({ type: 'array', items });

const paginated = (items: Schema): Schema => ({
  type: 'object',
  required: ['success', 'data', 'meta'],
  properties: {
    success: { type: 'boolean', example: true },
    data: { type: 'array', items },
    meta: { $ref: '#/components/schemas/PaginationMeta' },
  },
});

const ref = (name: string): Schema => ({ $ref: `#/components/schemas/${name}` });

// ---------------------------------------------------------------------------
// Entities (mirror src/models/*.model.ts)
// ---------------------------------------------------------------------------

const User: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    name: { type: 'string', example: 'Asha Verma' },
    email: { type: 'string', format: 'email', nullable: true, description: 'Optional — accounts register with mobile only' },
    mobile: { type: 'string', example: '9876543210' },
    role: { type: 'string', enum: ['PASSENGER', 'SUPPORT_EXEC', 'ADMIN', 'SUPER_ADMIN'] },
    isBlocked: { type: 'boolean' },
    profilePhotoUrl: { type: 'string', format: 'uri', nullable: true },
    preferences: {
      type: 'object',
      properties: {
        dietaryTags: { type: 'array', items: { type: 'string' } },
        cuisinePreferences: { type: 'array', items: { type: 'string' } },
      },
    },
    notificationSettings: {
      type: 'object',
      properties: {
        smsEnabled: { type: 'boolean' },
        emailEnabled: { type: 'boolean' },
        promotionalEnabled: { type: 'boolean' },
      },
    },
    lastLoginAt: dateTime(),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const CustomizationOption: Schema = {
  type: 'object',
  properties: {
    label: { type: 'string', example: 'Extra spicy' },
    priceDeltaPaise: paise('Additive price change for this option'),
  },
};

const CustomizationGroup: Schema = {
  type: 'object',
  properties: {
    name: { type: 'string', example: 'Spice level' },
    isRequired: { type: 'boolean' },
    maxSelect: { type: 'integer', example: 1 },
    options: { type: 'array', items: CustomizationOption },
  },
};

const Category: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    name: { type: 'string', example: 'Meals' },
    slug: { type: 'string', example: 'meals' },
    description: { type: 'string', nullable: true },
    imageUrl: { type: 'string', format: 'uri', nullable: true },
    icon: { type: 'string', nullable: true },
    displayOrder: { type: 'integer' },
    isActive: { type: 'boolean' },
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const MenuItem: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    categoryId: objectId(),
    name: { type: 'string', example: 'Veg Thali' },
    shortDescription: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
    price: paise('Unit price'),
    imageUrl: { type: 'string', format: 'uri', nullable: true },
    isVeg: { type: 'boolean' },
    isBestseller: { type: 'boolean' },
    ingredients: { type: 'array', items: { type: 'string' } },
    isAvailable: { type: 'boolean' },
    customizations: { type: 'array', items: CustomizationGroup },
    prepTimeMinutes: { type: 'integer', example: 20 },
    avgRating: { type: 'number', example: 4.3 },
    ratingCount: { type: 'integer' },
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const OrderItemCustomizationSelection: Schema = {
  type: 'object',
  properties: {
    groupName: { type: 'string' },
    optionLabel: { type: 'string' },
    priceDeltaPaise: paise(),
  },
};

const OrderItemSnapshot: Schema = {
  type: 'object',
  description: 'Snapshot of the menu item as it was at order time — never retroactively affected by later menu edits.',
  properties: {
    menuItemId: objectId(),
    name: { type: 'string' },
    price: paise('Unit price at order time'),
    quantity: { type: 'integer', minimum: 1 },
    customizations: { type: 'array', items: OrderItemCustomizationSelection },
    specialNote: { type: 'string', nullable: true },
    itemTotal: paise(),
  },
};

const OrderStatusHistoryEntry: Schema = {
  type: 'object',
  properties: {
    status: { $ref: '#/components/schemas/OrderStatus' },
    changedAt: dateTime(),
    changedBy: objectId(),
    note: { type: 'string', nullable: true },
  },
};

const OrderStatus: Schema = {
  type: 'string',
  enum: [
    'PENDING_PAYMENT',
    'PAYMENT_FAILED',
    'ORDER_PLACED',
    'RESTAURANT_NOTIFIED',
    'RESTAURANT_ACCEPTED',
    'RESTAURANT_REJECTED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'DELIVERY_FAILED',
    'CANCELLED_BY_PASSENGER',
    'CANCELLED_BY_RESTAURANT',
    'CANCELLED_BY_ADMIN',
    'REFUND_INITIATED',
    'REFUND_PROCESSED',
    'REFUND_FAILED',
    'COMPLETED',
    'DISPUTED',
  ],
};

const Order: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    orderId: { type: 'string', example: 'SRF-20260714-00042' },
    passengerId: objectId(),
    trainNumber: { type: 'string', nullable: true, example: '12345' },
    pnr: { type: 'string', nullable: true, example: '1234567890' },
    coach: { type: 'string', nullable: true, example: 'B4' },
    seat: { type: 'string', nullable: true, example: '32' },
    boardingStation: { type: 'string', nullable: true },
    deliveryStation: { type: 'string', example: 'NDLS' },
    deliveryStationEta: dateTime(),
    items: { type: 'array', items: OrderItemSnapshot },
    subtotal: paise(),
    deliveryFeePaise: paise(),
    platformFeePaise: paise(),
    gstAmountPaise: paise(),
    couponCode: { type: 'string', nullable: true },
    couponDiscountPaise: paise(),
    grandTotal: paise(),
    status: { $ref: '#/components/schemas/OrderStatus' },
    statusHistory: { type: 'array', items: OrderStatusHistoryEntry },
    paymentMode: { type: 'string', enum: ['online', 'cod'] },
    paymentMethod: { type: 'string', enum: ['UPI', 'COD'] },
    paymentStatus: { type: 'string', enum: ['pending', 'captured', 'failed', 'refunded', 'partial_refund'] },
    utrReference: { type: 'string', nullable: true, description: 'Customer-submitted UPI transaction reference (UTR)' },
    idempotencyKey: { type: 'string' },
    cancellationReason: { type: 'string', nullable: true },
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const ValidatedCartItem: Schema = {
  type: 'object',
  properties: {
    menuItemId: objectId(),
    name: { type: 'string' },
    price: paise(),
    quantity: { type: 'integer', minimum: 1 },
    customizations: { type: 'array', items: OrderItemCustomizationSelection },
    specialNote: { type: 'string', nullable: true },
    itemTotal: paise(),
  },
};

const ValidatedCart: Schema = {
  type: 'object',
  description: 'Server-recalculated cart — authoritative prices/availability, ignoring any client-supplied totals.',
  properties: {
    items: { type: 'array', items: ValidatedCartItem },
    subtotal: paise(),
    deliveryFeePaise: paise(),
    platformFeePaise: paise(),
    gstAmountPaise: paise(),
    couponId: objectId(),
    couponCode: { type: 'string', nullable: true },
    couponDiscountPaise: paise(),
    grandTotal: paise(),
  },
};

const Coupon: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    code: { type: 'string', example: 'WELCOME50' },
    description: { type: 'string' },
    discountType: { type: 'string', enum: ['PERCENTAGE', 'FLAT'] },
    discountValue: { type: 'number', example: 50 },
    maxDiscountPaise: paise(),
    minOrderValuePaise: paise(),
    validFrom: dateTime(),
    validUntil: dateTime(),
    usageLimitTotal: { type: 'integer', nullable: true },
    usageLimitPerUser: { type: 'integer' },
    usedCount: { type: 'integer' },
    isActive: { type: 'boolean' },
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const Rating: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    orderId: objectId(),
    passengerId: objectId(),
    menuItemId: objectId(),
    rating: { type: 'integer', minimum: 1, maximum: 5 },
    reviewText: { type: 'string', nullable: true },
    photos: { type: 'array', items: { type: 'string', format: 'uri' } },
    isFeatured: { type: 'boolean' },
    isHidden: { type: 'boolean' },
    editWindowExpiresAt: dateTime(),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const SupportTicket: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    ticketNumber: { type: 'string', example: 'TKT-100234' },
    userId: objectId(),
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', nullable: true },
    subject: { type: 'string' },
    message: { type: 'string' },
    category: { type: 'string', example: 'GENERAL' },
    status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
    assignedTo: objectId(),
    orderId: objectId(),
    resolutionNote: { type: 'string', nullable: true },
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const Notification: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    userId: objectId(),
    event: {
      type: 'string',
      enum: [
        'ORDER_PLACED',
        'ORDER_ACCEPTED',
        'ORDER_REJECTED',
        'ORDER_OUT_FOR_DELIVERY',
        'ORDER_DELIVERED',
        'ORDER_CANCELLED',
        'REFUND_PROCESSED',
        'SUPPORT_TICKET_UPDATED',
      ],
    },
    channel: { type: 'string', enum: ['SMS', 'EMAIL', 'IN_APP'] },
    title: { type: 'string' },
    body: { type: 'string' },
    isRead: { type: 'boolean' },
    relatedEntityType: { type: 'string', nullable: true },
    relatedEntityId: objectId(),
    dispatchStatus: { type: 'string', enum: ['PENDING', 'SENT', 'FAILED'] },
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const Station: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    name: { type: 'string', example: 'New Delhi' },
    code: { type: 'string', nullable: true, example: 'NDLS' },
    isActive: { type: 'boolean' },
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const TrainStop: Schema = {
  type: 'object',
  properties: {
    stationCode: { type: 'string', example: 'NDLS' },
    stationName: { type: 'string', example: 'New Delhi' },
    arrivalTime: { type: 'string', nullable: true, example: '14:35' },
    departureTime: { type: 'string', nullable: true, example: '14:40' },
    dayOffset: { type: 'integer', example: 0 },
    distanceKm: { type: 'number', nullable: true },
  },
};

const TrainSchedule: Schema = {
  type: 'object',
  properties: {
    trainNumber: { type: 'string', example: '12345' },
    trainName: { type: 'string', example: 'Rajdhani Express' },
    sourceStationCode: { type: 'string' },
    destinationStationCode: { type: 'string' },
    runsOnDays: { type: 'array', items: { type: 'string' } },
    stops: { type: 'array', items: TrainStop },
    fetchedAt: dateTime(),
    expiresAt: dateTime(),
  },
};

const TrainSearchResult: Schema = {
  type: 'object',
  properties: {
    trainNumber: { type: 'string', example: '12345' },
    trainName: { type: 'string', example: 'Rajdhani Express' },
    sourceStationCode: { type: 'string' },
    destinationStationCode: { type: 'string' },
  },
};

const PnrStatus: Schema = {
  type: 'object',
  properties: {
    pnr: { type: 'string', example: '1234567890' },
    trainNumber: { type: 'string' },
    trainName: { type: 'string' },
    boardingDate: { type: 'string', example: '2026-07-14' },
    boardingStationCode: { type: 'string' },
    reservationUpToStationCode: { type: 'string' },
    coach: { type: 'string' },
    seat: { type: 'string' },
    chartPrepared: { type: 'boolean' },
  },
};

const Invoice: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    orderId: objectId(),
    invoiceNumber: { type: 'string', example: 'INV-100234' },
    passengerId: objectId(),
    subtotalPaise: paise(),
    gstAmountPaise: paise(),
    deliveryFeePaise: paise(),
    platformFeePaise: paise(),
    discountPaise: paise(),
    grandTotalPaise: paise(),
    pdfUrl: { type: 'string', format: 'uri', nullable: true },
    generatedAt: dateTime(),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const RefundRecord: Schema = {
  type: 'object',
  properties: {
    refundId: { type: 'string' },
    amountPaise: paise(),
    reason: { type: 'string' },
    status: { type: 'string', enum: ['INITIATED', 'PROCESSED', 'FAILED'] },
    processedAt: dateTime(),
  },
};

const Payment: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    orderId: objectId(),
    transactionRef: { type: 'string', nullable: true, description: "Our reference embedded in the UPI deep link's tr param" },
    utrReference: { type: 'string', nullable: true, description: 'Customer-submitted UPI transaction reference (UTR)' },
    amountPaise: paise(),
    currency: { type: 'string', example: 'INR' },
    method: { type: 'string', enum: ['UPI', 'COD'] },
    status: { type: 'string', enum: ['pending', 'captured', 'failed', 'refunded', 'partial_refund'] },
    capturedAt: dateTime(),
    failureReason: { type: 'string', nullable: true },
    refunds: { type: 'array', items: RefundRecord },
    createdAt: dateTime(),
    updatedAt: dateTime(),
  },
};

const UpiPaymentInit: Schema = {
  type: 'object',
  description: 'Returned as `order.payment` on order creation for UPI orders — a backend-generated UPI deep link, no gateway involved (see ADR 0003).',
  properties: {
    upiLink: { type: 'string', example: 'upi://pay?pa=srfood@upi&pn=SR%20Food&am=250.00&tr=SRF-20260714-00042&tn=SR%20Food%20order%20SRF-20260714-00042' },
    payeeVpa: { type: 'string', example: 'srfood@upi' },
    payeeName: { type: 'string', example: 'SR Food' },
    amountPaise: paise(),
    currency: { type: 'string', example: 'INR' },
    transactionRef: { type: 'string' },
  },
};

const AuditLog: Schema = {
  type: 'object',
  properties: {
    _id: objectId(),
    actorId: objectId(),
    actorRole: { type: 'string' },
    action: { type: 'string', example: 'COUPON_CREATED' },
    entityType: { type: 'string', example: 'Coupon' },
    entityId: objectId(),
    before: { type: 'object', nullable: true, additionalProperties: true },
    after: { type: 'object', nullable: true, additionalProperties: true },
    ipAddress: { type: 'string', nullable: true },
    createdAt: dateTime(),
  },
};

const CmsHomepage: Schema = {
  type: 'object',
  properties: {
    hero: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          eyebrow: { type: 'string' },
          title: { type: 'string' },
          desc: { type: 'string' },
          cta: { type: 'string' },
        },
      },
    },
    offer: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        percent: { type: 'number' },
        headline: { type: 'string' },
        sub: { type: 'string' },
      },
    },
  },
};

const CmsFaqs: Schema = {
  type: 'object',
  properties: {
    faqs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
          displayOrder: { type: 'integer' },
        },
      },
    },
  },
};

const CmsLegal: Schema = {
  type: 'object',
  properties: { text: { type: 'string' } },
};

const CmsSettings: Schema = {
  type: 'object',
  properties: {
    social: {
      type: 'object',
      properties: {
        facebook: { type: 'string' },
        instagram: { type: 'string' },
        twitter: { type: 'string' },
        youtube: { type: 'string' },
      },
    },
    contactEmail: { type: 'string', format: 'email' },
    contactPhone: { type: 'string' },
    contactAddress: { type: 'string' },
    whatsappNumber: { type: 'string' },
    upiVpa: { type: 'string', example: 'srfood@ybl', description: 'UPI ID that receives customer payments' },
    upiPayeeName: { type: 'string', example: 'SR Food' },
  },
};

// ---------------------------------------------------------------------------
// Auth-specific response payloads
// ---------------------------------------------------------------------------

const AuthTokens: Schema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string', description: 'JWT, 1 hour validity' },
    refreshToken: { type: 'string', description: 'Opaque, 7 day validity, rotated on use' },
  },
};

const AuthenticatedUserView: Schema = {
  type: 'object',
  properties: {
    id: objectId(),
    name: { type: 'string' },
    email: { type: 'string', format: 'email', nullable: true },
    mobile: { type: 'string' },
    role: { type: 'string', enum: ['PASSENGER', 'SUPPORT_EXEC', 'ADMIN', 'SUPER_ADMIN'] },
  },
};

// ---------------------------------------------------------------------------
// Envelope / error schemas
// ---------------------------------------------------------------------------

const PaginationMeta: Schema = {
  type: 'object',
  properties: {
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 20 },
    total: { type: 'integer', example: 57 },
    totalPages: { type: 'integer', example: 3 },
  },
};

const ErrorResponse: Schema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'VALIDATION_ERROR' },
        message: { type: 'string', example: 'Validation failed' },
        details: { nullable: true },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------

export const schemas: Record<string, Schema> = {
  PaginationMeta,
  ErrorResponse,
  OrderStatus,

  User,
  Category,
  MenuItem,
  CustomizationGroup,
  CustomizationOption,
  Order,
  OrderItemSnapshot,
  OrderItemCustomizationSelection,
  OrderStatusHistoryEntry,
  ValidatedCart,
  ValidatedCartItem,
  Coupon,
  Rating,
  SupportTicket,
  Notification,
  Station,
  TrainSchedule,
  TrainStop,
  TrainSearchResult,
  PnrStatus,
  Invoice,
  Payment,
  UpiPaymentInit,
  RefundRecord,
  AuditLog,
  CmsHomepage,
  CmsFaqs,
  CmsLegal,
  CmsSettings,
  AuthTokens,
  AuthenticatedUserView,

  // Named envelopes referenced directly from route JSDoc via $ref, so each
  // endpoint only has to name its data shape once instead of repeating the
  // success/pagination wrapper inline.
  UserResponse: success(ref('User')),
  UserListResponse: paginated(ref('User')),
  RoleCountsResponse: successArray({
    type: 'object',
    properties: { role: { type: 'string' }, userCount: { type: 'integer' } },
  }),

  CategoryResponse: success(ref('Category')),
  CategoryListResponse: successArray(ref('Category')),
  MenuItemResponse: success(ref('MenuItem')),
  MenuItemListResponse: successArray(ref('MenuItem')),
  FullMenuResponse: success({
    type: 'object',
    properties: {
      categories: { type: 'array', items: ref('Category') },
      items: { type: 'array', items: ref('MenuItem') },
    },
  }),

  ValidatedCartResponse: success(ref('ValidatedCart')),

  CouponResponse: success(ref('Coupon')),
  CouponListResponse: successArray(ref('Coupon')),
  CouponAdminListResponse: paginated(ref('Coupon')),
  CouponValidationResponse: success({
    type: 'object',
    properties: { discountPaise: paise('Computed discount for the supplied cart subtotal'), code: { type: 'string' } },
  }),

  OrderResponse: success(ref('Order')),
  OrderListResponse: paginated(ref('Order')),
  CreateOrderResponse: success({
    type: 'object',
    properties: {
      order: ref('Order'),
      payment: { oneOf: [ref('UpiPaymentInit'), { type: 'null' }], description: 'null for COD orders' },
      replay: { type: 'boolean', description: 'true if this Idempotency-Key was already used — the original order was returned' },
    },
  }),

  PaymentResponse: success(ref('Payment')),

  RatingResponse: success(ref('Rating')),
  RatingListResponse: successArray(ref('Rating')),

  SupportTicketResponse: success(ref('SupportTicket')),
  SupportTicketListResponse: paginated(ref('SupportTicket')),

  TrainSearchResponse: successArray(ref('TrainSearchResult')),
  PnrStatusResponse: success(ref('PnrStatus')),
  TrainScheduleResponse: success(ref('TrainSchedule')),

  StationResponse: success(ref('Station')),
  StationListResponse: successArray(ref('Station')),

  InvoiceResponse: success(ref('Invoice')),

  NotificationResponse: success(ref('Notification')),
  NotificationListResponse: paginated(ref('Notification')),

  AuditLogListResponse: paginated(ref('AuditLog')),

  CmsHomepageResponse: success(ref('CmsHomepage')),
  CmsFaqsResponse: success(ref('CmsFaqs')),
  CmsLegalResponse: success(ref('CmsLegal')),
  CmsSettingsResponse: success(ref('CmsSettings')),

  LoginResponse: success({
    type: 'object',
    properties: { tokens: ref('AuthTokens'), user: ref('AuthenticatedUserView') },
  }),
  TokensResponse: success(ref('AuthTokens')),
  NullDataResponse: success({ type: 'null' }),

  DashboardSummaryResponse: success({
    type: 'object',
    properties: {
      totalRevenuePaise: paise(),
      totalOrders: { type: 'integer' },
      pendingOrders: { type: 'integer' },
      totalUsers: { type: 'integer' },
      totalMenuItems: { type: 'integer' },
      recentOrders: { type: 'array', items: ref('Order') },
    },
  }),
  AnalyticsFunnelResponse: success({
    type: 'object',
    properties: {
      placed: { type: 'integer' },
      accepted: { type: 'integer' },
      outForDelivery: { type: 'integer' },
      delivered: { type: 'integer' },
      cancelled: { type: 'integer' },
    },
  }),
  AnalyticsRevenueResponse: successArray({
    type: 'object',
    properties: { _id: { type: 'string', description: 'Date (YYYY-MM-DD)' }, revenuePaise: paise(), orderCount: { type: 'integer' } },
  }),
  AnalyticsStationsResponse: successArray({
    type: 'object',
    properties: { _id: { type: 'string', description: 'Delivery station name' }, orderCount: { type: 'integer' } },
  }),
  AnalyticsPaymentsResponse: successArray({
    type: 'object',
    properties: {
      _id: {
        type: 'object',
        properties: { method: { type: 'string', enum: ['UPI', 'COD'] }, status: { type: 'string' } },
      },
      count: { type: 'integer' },
      totalPaise: paise(),
    },
  }),
  OrdersReportResponse: successArray({
    type: 'object',
    properties: {
      orderId: { type: 'string' },
      status: ref('OrderStatus'),
      paymentStatus: { type: 'string' },
      grandTotal: paise(),
      createdAt: dateTime(),
    },
  }),
  RevenueReportResponse: successArray({
    type: 'object',
    properties: { _id: { type: 'string', description: 'Date (YYYY-MM-DD)' }, revenuePaise: paise(), orderCount: { type: 'integer' } },
  }),
  UsersReportResponse: successArray({
    type: 'object',
    properties: { _id: { type: 'string', description: 'Date (YYYY-MM-DD)' }, newUsers: { type: 'integer' } },
  }),
};

// ---------------------------------------------------------------------------
// Reusable `responses` — referenced via $ref: '#/components/responses/<Name>'
// ---------------------------------------------------------------------------

function errorResponse(description: string): Schema {
  return {
    description,
    content: { 'application/json': { schema: ref('ErrorResponse') } },
  };
}

export const responses: Record<string, Schema> = {
  BadRequest: errorResponse('The request could not be processed as sent (e.g. malformed input, business-rule violation)'),
  Unauthorized: errorResponse('Missing, invalid, or expired bearer token'),
  Forbidden: errorResponse("Authenticated, but the caller's role does not permit this action"),
  NotFound: errorResponse('No resource exists at this id/path'),
  Conflict: errorResponse('The request conflicts with existing state (e.g. duplicate value)'),
  ValidationError: errorResponse('Request body/query/params failed schema validation'),
  TooManyRequests: errorResponse('Rate limit exceeded — retry after a delay'),
};
