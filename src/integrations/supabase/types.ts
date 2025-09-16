export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          abandoned_at: string | null
          cart_id: string | null
          email: string | null
          id: string
          last_notification_sent: string | null
          notification_count: number | null
          recovery_status: string | null
          user_id: string | null
        }
        Insert: {
          abandoned_at?: string | null
          cart_id?: string | null
          email?: string | null
          id?: string
          last_notification_sent?: string | null
          notification_count?: number | null
          recovery_status?: string | null
          user_id?: string | null
        }
        Update: {
          abandoned_at?: string | null
          cart_id?: string | null
          email?: string | null
          id?: string
          last_notification_sent?: string | null
          notification_count?: number | null
          recovery_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_analytics: {
        Row: {
          active_products: number
          created_at: string | null
          date: string
          id: string
          orders_count: number
          total_revenue: number
          total_users: number
        }
        Insert: {
          active_products?: number
          created_at?: string | null
          date?: string
          id?: string
          orders_count?: number
          total_revenue?: number
          total_users?: number
        }
        Update: {
          active_products?: number
          created_at?: string | null
          date?: string
          id?: string
          orders_count?: number
          total_revenue?: number
          total_users?: number
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          message: string
          start_date: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          message: string
          start_date?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          message?: string
          start_date?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string
          gender: string | null
          id: string
          last_name: string
          password_hash: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          password_hash: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          password_hash?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      answers: {
        Row: {
          answer: string
          created_at: string | null
          helpful_votes: number | null
          id: string
          is_official: boolean | null
          question_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_official?: boolean | null
          question_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_official?: boolean | null
          question_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bundle_items: {
        Row: {
          bundle_id: string | null
          id: string
          product_id: string | null
          quantity: number
        }
        Insert: {
          bundle_id?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
        }
        Update: {
          bundle_id?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string | null
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          updated_at?: string | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          message: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          currency: string
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          minimum_purchase: number | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          currency?: string
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_purchase?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          currency?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_purchase?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_analytics: {
        Row: {
          average_order_value: number | null
          created_at: string | null
          favorite_category_id: string | null
          id: string
          last_purchase_date: string | null
          lifetime_value: number | null
          purchase_frequency: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          average_order_value?: number | null
          created_at?: string | null
          favorite_category_id?: string | null
          id?: string
          last_purchase_date?: string | null
          lifetime_value?: number | null
          purchase_frequency?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          average_order_value?: number | null
          created_at?: string | null
          favorite_category_id?: string | null
          id?: string
          last_purchase_date?: string | null
          lifetime_value?: number | null
          purchase_frequency?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_analytics_favorite_category_id_fkey"
            columns: ["favorite_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_spending_history: {
        Row: {
          amount_spent: number
          created_at: string | null
          id: string
          month: number
          number_of_orders: number
          updated_at: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          amount_spent?: number
          created_at?: string | null
          id?: string
          month: number
          number_of_orders?: number
          updated_at?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          amount_spent?: number
          created_at?: string | null
          id?: string
          month?: number
          number_of_orders?: number
          updated_at?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: []
      }
      login_history: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string | null
          id: string
          points: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          points?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          points: number
          reference_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mpesa_configurations: {
        Row: {
          created_at: string
          created_by: string | null
          environment: string
          id: string
          is_active: boolean
          name: string
          shortcode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          environment: string
          id?: string
          is_active?: boolean
          name: string
          shortcode: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          environment?: string
          id?: string
          is_active?: boolean
          name?: string
          shortcode?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_data: Json | null
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_data?: Json | null
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string | null
          product_data?: Json | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_approved: boolean | null
          billing_address: Json | null
          created_at: string | null
          currency: string
          discount_amount: number | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          promo_code: string | null
          shipping_address: Json
          shipping_city: string | null
          shipping_cost: number | null
          shipping_country: string | null
          shipping_method: string | null
          shipping_name: string | null
          shipping_phone: string | null
          shipping_postal_code: string | null
          status: string
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_approved?: boolean | null
          billing_address?: Json | null
          created_at?: string | null
          currency?: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          promo_code?: string | null
          shipping_address: Json
          shipping_city?: string | null
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_method?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_postal_code?: string | null
          status?: string
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_approved?: boolean | null
          billing_address?: Json | null
          created_at?: string | null
          currency?: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          promo_code?: string | null
          shipping_address?: Json
          shipping_city?: string | null
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_method?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_postal_code?: string | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          code: string
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_verification: boolean | null
          updated_at: string | null
        }
        Insert: {
          code: string
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_verification?: boolean | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_verification?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          mpesa_receipt_number: string | null
          order_id: string | null
          payment_date: string | null
          payment_method_code: string
          phone_number: string | null
          status: string
          transaction_reference: string | null
          updated_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_method_code: string
          phone_number?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_method_code?: string
          phone_number?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      paypal_configurations: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          environment: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          environment: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          environment?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_bundles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_amount: number | null
          id: string
          is_public: boolean | null
          name: string
          total_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          id?: string
          is_public?: boolean | null
          name: string
          total_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          id?: string
          is_public?: boolean | null
          name?: string
          total_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          id: string
          is_primary: boolean | null
          product_id: string | null
          sort_order: number | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          id?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          url: string
        }
        Update: {
          alt_text?: string | null
          id?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          id: string
          name: string
          product_id: string | null
          value: string
        }
        Insert: {
          id?: string
          name: string
          product_id?: string | null
          value: string
        }
        Update: {
          id?: string
          name?: string
          product_id?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_status: {
        Row: {
          description: string | null
          status: string
        }
        Insert: {
          description?: string | null
          status: string
        }
        Update: {
          description?: string | null
          status?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          ar_enabled: boolean | null
          brand: string | null
          category_id: string | null
          created_at: string | null
          currency: string
          description: string
          flash_sale_category: string | null
          flash_sale_discount_percentage: number | null
          flash_sale_end: string | null
          flash_sale_time_slot: string | null
          id: string
          image_url: string | null
          image_url_1: string | null
          image_url_2: string | null
          image_url_3: string | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_flash_sale: boolean | null
          is_new: boolean | null
          model: string | null
          model_3d_url: string | null
          name: string
          original_price: number | null
          price: number
          return_policy: string | null
          short_description: string | null
          sku: string | null
          slug: string
          status: string | null
          stock_quantity: number
          sustainability_score: number | null
          updated_at: string | null
          vendor_id: string | null
          video_url: string | null
          warranty_info: string | null
        }
        Insert: {
          ar_enabled?: boolean | null
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          currency?: string
          description: string
          flash_sale_category?: string | null
          flash_sale_discount_percentage?: number | null
          flash_sale_end?: string | null
          flash_sale_time_slot?: string | null
          id?: string
          image_url?: string | null
          image_url_1?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_flash_sale?: boolean | null
          is_new?: boolean | null
          model?: string | null
          model_3d_url?: string | null
          name: string
          original_price?: number | null
          price: number
          return_policy?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          status?: string | null
          stock_quantity?: number
          sustainability_score?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          video_url?: string | null
          warranty_info?: string | null
        }
        Update: {
          ar_enabled?: boolean | null
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string
          flash_sale_category?: string | null
          flash_sale_discount_percentage?: number | null
          flash_sale_end?: string | null
          flash_sale_time_slot?: string | null
          id?: string
          image_url?: string | null
          image_url_1?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_flash_sale?: boolean | null
          is_new?: boolean | null
          model?: string | null
          model_3d_url?: string | null
          name?: string
          original_price?: number | null
          price?: number
          return_policy?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          status?: string | null
          stock_quantity?: number
          sustainability_score?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          video_url?: string | null
          warranty_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          auth_provider: string | null
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          city: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          first_name: string | null
          id: string
          is_banned: boolean | null
          last_name: string | null
          phone: string | null
          postal_code: string | null
          preferences: Json | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          auth_provider?: string | null
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_banned?: boolean | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          auth_provider?: string | null
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_banned?: boolean | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          question: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          question: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          question?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_votes: number | null
          id: string
          is_verified_purchase: boolean | null
          product_id: string | null
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_notifications: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_notified: boolean | null
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_notified?: boolean | null
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_notified?: boolean | null
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          type: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          type?: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          type?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      user_coupon_usage: {
        Row: {
          coupon_id: string | null
          id: string
          order_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payment_methods: {
        Row: {
          account_number: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          is_default: boolean | null
          payment_type: string
          provider: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_default?: boolean | null
          payment_type: string
          provider: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_default?: boolean | null
          payment_type?: string
          provider?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: []
      }
      user_shipping_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          phone: string | null
          postal_code: string
          state: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          phone?: string | null
          postal_code: string
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string | null
          postal_code?: string
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: Json | null
          business_name: string
          commission_rate: number | null
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_approved: boolean | null
          logo_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          business_name: string
          commission_rate?: number | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          logo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          business_name?: string
          commission_rate?: number | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          logo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          wishlist_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          wishlist_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          wishlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: { admin_email: string; admin_password: string }
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
        }[]
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_products: number
          orders_count: number
          orders_growth_percentage: number
          products_growth_percentage: number
          revenue_growth_percentage: number
          total_revenue: number
          total_users: number
          user_growth_percentage: number
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_vendor: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      order_status:
        | "pending_approval"
        | "approved"
        | "processing"
        | "shipped"
        | "completed"
        | "cancelled"
      user_role: "customer" | "admin" | "vendor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending_approval",
        "approved",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ],
      user_role: ["customer", "admin", "vendor"],
    },
  },
} as const
