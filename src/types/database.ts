// AUTO-GENERATED — do not edit by hand.
// Regenerate with:  npm run db:types
// Source of truth: supabase/migrations/*.sql

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      access_assignments: {
        Row: {
          id: string;
          resource_id: string;
          placement_id: string;
          access_level: string | null;
          status: Database['public']['Enums']['access_assignment_status'];
          requested_at: string;
          provisioned_at: string | null;
          revoke_by: string | null;
          revoked_at: string | null;
          approved_by: string | null;
          completed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          placement_id: string;
          access_level?: string | null;
          status?: Database['public']['Enums']['access_assignment_status'];
          requested_at?: string;
          provisioned_at?: string | null;
          revoke_by?: string | null;
          revoked_at?: string | null;
          approved_by?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          placement_id?: string;
          access_level?: string | null;
          status?: Database['public']['Enums']['access_assignment_status'];
          requested_at?: string;
          provisioned_at?: string | null;
          revoke_by?: string | null;
          revoked_at?: string | null;
          approved_by?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "access_assignments_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "system_access_resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "access_assignments_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "access_assignments_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "access_assignments_completed_by_fkey";
            columns: ["completed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_insights: {
        Row: {
          id: string;
          scope_type: string;
          scope_id: string;
          insight_type: string;
          title: string;
          summary: string;
          evidence: Json;
          recommendation: string | null;
          confidence: number | null;
          model_reference: string | null;
          status: Database['public']['Enums']['insight_status'];
          reviewed_by: string | null;
          reviewed_at: string | null;
          generated_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          scope_type: string;
          scope_id: string;
          insight_type: string;
          title: string;
          summary: string;
          evidence?: Json;
          recommendation?: string | null;
          confidence?: number | null;
          model_reference?: string | null;
          status?: Database['public']['Enums']['insight_status'];
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          generated_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          scope_type?: string;
          scope_id?: string;
          insight_type?: string;
          title?: string;
          summary?: string;
          evidence?: Json;
          recommendation?: string | null;
          confidence?: number | null;
          model_reference?: string | null;
          status?: Database['public']['Enums']['insight_status'];
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          generated_at?: string;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_insights_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      alumni_profiles: {
        Row: {
          id: string;
          profile_id: string;
          latest_outcome_id: string | null;
          current_title: string | null;
          current_organization: string | null;
          available_for_projects: boolean;
          available_for_mentoring: boolean;
          contact_consent: boolean;
          contact_consent_at: string | null;
          last_contacted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          latest_outcome_id?: string | null;
          current_title?: string | null;
          current_organization?: string | null;
          available_for_projects?: boolean;
          available_for_mentoring?: boolean;
          contact_consent?: boolean;
          contact_consent_at?: string | null;
          last_contacted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          latest_outcome_id?: string | null;
          current_title?: string | null;
          current_organization?: string | null;
          available_for_projects?: boolean;
          available_for_mentoring?: boolean;
          contact_consent?: boolean;
          contact_consent_at?: string | null;
          last_contacted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alumni_profiles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alumni_profiles_latest_outcome_id_fkey";
            columns: ["latest_outcome_id"];
            isOneToOne: false;
            referencedRelation: "internship_outcomes";
            referencedColumns: ["id"];
          },
        ];
      };
      announcements: {
        Row: {
          id: string;
          programme_id: string | null;
          title: string;
          body: string;
          audience_roles: Database['public']['Enums']['app_role'][];
          published_at: string | null;
          expires_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          programme_id?: string | null;
          title: string;
          body: string;
          audience_roles?: Database['public']['Enums']['app_role'][];
          published_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          programme_id?: string | null;
          title?: string;
          body?: string;
          audience_roles?: Database['public']['Enums']['app_role'][];
          published_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "announcements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      application_documents: {
        Row: {
          id: string;
          application_id: string;
          document_type: string;
          title: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          document_type: string;
          title: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          document_type?: string;
          title?: string;
          storage_path?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      application_reviews: {
        Row: {
          id: string;
          application_id: string;
          reviewer_id: string;
          recommendation: Database['public']['Enums']['application_status'];
          score: number | null;
          evidence: Json;
          notes: string | null;
          is_final: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          reviewer_id: string;
          recommendation: Database['public']['Enums']['application_status'];
          score?: number | null;
          evidence?: Json;
          notes?: string | null;
          is_final?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          reviewer_id?: string;
          recommendation?: Database['public']['Enums']['application_status'];
          score?: number | null;
          evidence?: Json;
          notes?: string | null;
          is_final?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_reviews_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          id: string;
          opportunity_id: string;
          applicant_user_id: string | null;
          application_number: string;
          full_name: string;
          email: string;
          phone: string | null;
          location: string | null;
          date_of_birth: string | null;
          institution: string | null;
          academic_programme: string | null;
          academic_level: string | null;
          expected_graduation_date: string | null;
          skills: string[];
          technologies: string[];
          project_summary: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          preferred_duration_weeks: number | null;
          available_from: string | null;
          school_requirements: string | null;
          preferred_arrangement: Database['public']['Enums']['work_arrangement'] | null;
          career_interests: string[];
          source: string | null;
          status: Database['public']['Enums']['application_status'];
          fit_score: number | null;
          fit_explanation: string | null;
          privacy_notice_version: string;
          privacy_consent_at: string;
          screening_consent: boolean;
          submitted_at: string;
          withdrawn_at: string | null;
          retention_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          applicant_user_id?: string | null;
          application_number?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          location?: string | null;
          date_of_birth?: string | null;
          institution?: string | null;
          academic_programme?: string | null;
          academic_level?: string | null;
          expected_graduation_date?: string | null;
          skills?: string[];
          technologies?: string[];
          project_summary?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          preferred_duration_weeks?: number | null;
          available_from?: string | null;
          school_requirements?: string | null;
          preferred_arrangement?: Database['public']['Enums']['work_arrangement'] | null;
          career_interests?: string[];
          source?: string | null;
          status?: Database['public']['Enums']['application_status'];
          fit_score?: number | null;
          fit_explanation?: string | null;
          privacy_notice_version: string;
          privacy_consent_at: string;
          screening_consent?: boolean;
          submitted_at?: string;
          withdrawn_at?: string | null;
          retention_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          applicant_user_id?: string | null;
          application_number?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          location?: string | null;
          date_of_birth?: string | null;
          institution?: string | null;
          academic_programme?: string | null;
          academic_level?: string | null;
          expected_graduation_date?: string | null;
          skills?: string[];
          technologies?: string[];
          project_summary?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          preferred_duration_weeks?: number | null;
          available_from?: string | null;
          school_requirements?: string | null;
          preferred_arrangement?: Database['public']['Enums']['work_arrangement'] | null;
          career_interests?: string[];
          source?: string | null;
          status?: Database['public']['Enums']['application_status'];
          fit_score?: number | null;
          fit_explanation?: string | null;
          privacy_notice_version?: string;
          privacy_consent_at?: string;
          screening_consent?: boolean;
          submitted_at?: string;
          withdrawn_at?: string | null;
          retention_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
        ];
      };
      asset_assignments: {
        Row: {
          id: string;
          asset_id: string;
          placement_id: string;
          status: Database['public']['Enums']['asset_assignment_status'];
          issued_at: string | null;
          due_back_at: string | null;
          returned_at: string | null;
          issue_condition: string | null;
          return_condition: string | null;
          issued_by: string | null;
          received_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          placement_id: string;
          status?: Database['public']['Enums']['asset_assignment_status'];
          issued_at?: string | null;
          due_back_at?: string | null;
          returned_at?: string | null;
          issue_condition?: string | null;
          return_condition?: string | null;
          issued_by?: string | null;
          received_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          placement_id?: string;
          status?: Database['public']['Enums']['asset_assignment_status'];
          issued_at?: string | null;
          due_back_at?: string | null;
          returned_at?: string | null;
          issue_condition?: string | null;
          return_condition?: string | null;
          issued_by?: string | null;
          received_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_assignments_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_assignments_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_assignments_issued_by_fkey";
            columns: ["issued_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_assignments_received_by_fkey";
            columns: ["received_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          id: string;
          asset_tag: string;
          name: string;
          category: string;
          serial_number: string | null;
          condition: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_tag: string;
          name: string;
          category: string;
          serial_number?: string | null;
          condition?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_tag?: string;
          name?: string;
          category?: string;
          serial_number?: string | null;
          condition?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      attendance_records: {
        Row: {
          id: string;
          placement_id: string;
          record_date: string;
          status: Database['public']['Enums']['attendance_status'];
          check_in_at: string | null;
          check_out_at: string | null;
          hours_logged: number;
          notes: string | null;
          recorded_by: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          record_date: string;
          status: Database['public']['Enums']['attendance_status'];
          check_in_at?: string | null;
          check_out_at?: string | null;
          hours_logged?: number;
          notes?: string | null;
          recorded_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          record_date?: string;
          status?: Database['public']['Enums']['attendance_status'];
          check_in_at?: string | null;
          check_out_at?: string | null;
          hours_logged?: number;
          notes?: string | null;
          recorded_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_records_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_records_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_records_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: number;
          actor_id: string | null;
          actor_role: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          changed_fields: string[];
          request_id: string | null;
          occurred_at: string;
        };
        Insert: {
          id?: number;
          actor_id?: string | null;
          actor_role?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          changed_fields?: string[];
          request_id?: string | null;
          occurred_at?: string;
        };
        Update: {
          id?: number;
          actor_id?: string | null;
          actor_role?: string | null;
          action?: string;
          table_name?: string;
          record_id?: string | null;
          changed_fields?: string[];
          request_id?: string | null;
          occurred_at?: string;
        };
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          outcome_id: string;
          certificate_number: string;
          issued_at: string;
          issued_by: string | null;
          storage_path: string | null;
          verification_token: string;
          revoked_at: string | null;
          revocation_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          outcome_id: string;
          certificate_number: string;
          issued_at?: string;
          issued_by?: string | null;
          storage_path?: string | null;
          verification_token?: string;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          outcome_id?: string;
          certificate_number?: string;
          issued_at?: string;
          issued_by?: string | null;
          storage_path?: string | null;
          verification_token?: string;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "certificates_outcome_id_fkey";
            columns: ["outcome_id"];
            isOneToOne: true;
            referencedRelation: "internship_outcomes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_issued_by_fkey";
            columns: ["issued_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      competencies: {
        Row: {
          id: string;
          code: string;
          name: string;
          category: string;
          description: string | null;
          level_descriptors: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          category: string;
          description?: string | null;
          level_descriptors?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          category?: string;
          description?: string | null;
          level_descriptors?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      completion_requirements: {
        Row: {
          id: string;
          placement_id: string;
          category: string;
          title: string;
          is_required: boolean;
          is_complete: boolean;
          evidence_url: string | null;
          completed_at: string | null;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          category: string;
          title: string;
          is_required?: boolean;
          is_complete?: boolean;
          evidence_url?: string | null;
          completed_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          category?: string;
          title?: string;
          is_required?: boolean;
          is_complete?: boolean;
          evidence_url?: string | null;
          completed_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "completion_requirements_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completion_requirements_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      data_retention_policies: {
        Row: {
          id: string;
          record_category: string;
          purpose: string;
          retention_months: number;
          deletion_method: string;
          legal_or_policy_basis: string | null;
          owner_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          record_category: string;
          purpose: string;
          retention_months: number;
          deletion_method: string;
          legal_or_policy_basis?: string | null;
          owner_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          record_category?: string;
          purpose?: string;
          retention_months?: number;
          deletion_method?: string;
          legal_or_policy_basis?: string | null;
          owner_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "data_retention_policies_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      data_subject_requests: {
        Row: {
          id: string;
          requester_profile_id: string | null;
          requester_email: string;
          request_type: Database['public']['Enums']['data_request_type'];
          details: string | null;
          status: Database['public']['Enums']['data_request_status'];
          identity_verified_at: string | null;
          assigned_to: string | null;
          due_at: string | null;
          completed_at: string | null;
          response_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_profile_id?: string | null;
          requester_email: string;
          request_type: Database['public']['Enums']['data_request_type'];
          details?: string | null;
          status?: Database['public']['Enums']['data_request_status'];
          identity_verified_at?: string | null;
          assigned_to?: string | null;
          due_at?: string | null;
          completed_at?: string | null;
          response_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_profile_id?: string | null;
          requester_email?: string;
          request_type?: Database['public']['Enums']['data_request_type'];
          details?: string | null;
          status?: Database['public']['Enums']['data_request_status'];
          identity_verified_at?: string | null;
          assigned_to?: string | null;
          due_at?: string | null;
          completed_at?: string | null;
          response_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "data_subject_requests_requester_profile_id_fkey";
            columns: ["requester_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "data_subject_requests_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          lead_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          lead_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          lead_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "departments_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      evaluation_scores: {
        Row: {
          id: string;
          evaluation_id: string;
          criterion_id: string | null;
          competency_id: string | null;
          score: number;
          comment: string;
          evidence_ids: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          evaluation_id: string;
          criterion_id?: string | null;
          competency_id?: string | null;
          score: number;
          comment: string;
          evidence_ids?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          evaluation_id?: string;
          criterion_id?: string | null;
          competency_id?: string | null;
          score?: number;
          comment?: string;
          evidence_ids?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evaluation_scores_evaluation_id_fkey";
            columns: ["evaluation_id"];
            isOneToOne: false;
            referencedRelation: "evaluations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluation_scores_criterion_id_fkey";
            columns: ["criterion_id"];
            isOneToOne: false;
            referencedRelation: "rubric_criteria";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluation_scores_competency_id_fkey";
            columns: ["competency_id"];
            isOneToOne: false;
            referencedRelation: "competencies";
            referencedColumns: ["id"];
          },
        ];
      };
      evaluations: {
        Row: {
          id: string;
          placement_id: string;
          rubric_id: string | null;
          evaluator_id: string;
          evaluation_type: Database['public']['Enums']['evaluation_type'];
          source: Database['public']['Enums']['feedback_source'];
          status: Database['public']['Enums']['evaluation_status'];
          overall_score: number | null;
          strengths: string | null;
          development_areas: string | null;
          recommendation: string | null;
          evidence_summary: string | null;
          submitted_at: string | null;
          acknowledged_at: string | null;
          locked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          rubric_id?: string | null;
          evaluator_id: string;
          evaluation_type: Database['public']['Enums']['evaluation_type'];
          source: Database['public']['Enums']['feedback_source'];
          status?: Database['public']['Enums']['evaluation_status'];
          overall_score?: number | null;
          strengths?: string | null;
          development_areas?: string | null;
          recommendation?: string | null;
          evidence_summary?: string | null;
          submitted_at?: string | null;
          acknowledged_at?: string | null;
          locked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          rubric_id?: string | null;
          evaluator_id?: string;
          evaluation_type?: Database['public']['Enums']['evaluation_type'];
          source?: Database['public']['Enums']['feedback_source'];
          status?: Database['public']['Enums']['evaluation_status'];
          overall_score?: number | null;
          strengths?: string | null;
          development_areas?: string | null;
          recommendation?: string | null;
          evidence_summary?: string | null;
          submitted_at?: string | null;
          acknowledged_at?: string | null;
          locked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evaluations_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluations_rubric_id_fkey";
            columns: ["rubric_id"];
            isOneToOne: false;
            referencedRelation: "rubrics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluations_evaluator_id_fkey";
            columns: ["evaluator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      event_attendance: {
        Row: {
          event_id: string;
          placement_id: string;
          status: Database['public']['Enums']['attendance_status'];
          notes: string | null;
          marked_at: string;
        };
        Insert: {
          event_id: string;
          placement_id: string;
          status?: Database['public']['Enums']['attendance_status'];
          notes?: string | null;
          marked_at?: string;
        };
        Update: {
          event_id?: string;
          placement_id?: string;
          status?: Database['public']['Enums']['attendance_status'];
          notes?: string | null;
          marked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "programme_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_attendance_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback_entries: {
        Row: {
          id: string;
          placement_id: string;
          project_id: string | null;
          task_id: string | null;
          competency_id: string | null;
          author_id: string | null;
          source: Database['public']['Enums']['feedback_source'];
          rating: number | null;
          strengths: string | null;
          development_areas: string | null;
          next_action: string | null;
          is_visible_to_intern: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          project_id?: string | null;
          task_id?: string | null;
          competency_id?: string | null;
          author_id?: string | null;
          source: Database['public']['Enums']['feedback_source'];
          rating?: number | null;
          strengths?: string | null;
          development_areas?: string | null;
          next_action?: string | null;
          is_visible_to_intern?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          project_id?: string | null;
          task_id?: string | null;
          competency_id?: string | null;
          author_id?: string | null;
          source?: Database['public']['Enums']['feedback_source'];
          rating?: number | null;
          strengths?: string | null;
          development_areas?: string | null;
          next_action?: string | null;
          is_visible_to_intern?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_entries_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_entries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_entries_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_entries_competency_id_fkey";
            columns: ["competency_id"];
            isOneToOne: false;
            referencedRelation: "competencies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_entries_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      intern_documents: {
        Row: {
          id: string;
          placement_id: string;
          document_type: string;
          title: string;
          storage_path: string | null;
          status: Database['public']['Enums']['document_status'];
          is_sensitive: boolean;
          expires_at: string | null;
          notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          document_type: string;
          title: string;
          storage_path?: string | null;
          status?: Database['public']['Enums']['document_status'];
          is_sensitive?: boolean;
          expires_at?: string | null;
          notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          document_type?: string;
          title?: string;
          storage_path?: string | null;
          status?: Database['public']['Enums']['document_status'];
          is_sensitive?: boolean;
          expires_at?: string | null;
          notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "intern_documents_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "intern_documents_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      internship_check_ins: {
        Row: {
          id: string;
          placement_id: string;
          period_start: string;
          period_end: string;
          status: Database['public']['Enums']['check_in_status'];
          achievements: string | null;
          learning: string | null;
          blockers: string | null;
          next_steps: string | null;
          support_needed: string | null;
          wellbeing_rating: number | null;
          mentor_feedback: string | null;
          mentor_focus: string | null;
          reviewed_by: string | null;
          submitted_at: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          period_start: string;
          period_end: string;
          status?: Database['public']['Enums']['check_in_status'];
          achievements?: string | null;
          learning?: string | null;
          blockers?: string | null;
          next_steps?: string | null;
          support_needed?: string | null;
          wellbeing_rating?: number | null;
          mentor_feedback?: string | null;
          mentor_focus?: string | null;
          reviewed_by?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          period_start?: string;
          period_end?: string;
          status?: Database['public']['Enums']['check_in_status'];
          achievements?: string | null;
          learning?: string | null;
          blockers?: string | null;
          next_steps?: string | null;
          support_needed?: string | null;
          wellbeing_rating?: number | null;
          mentor_feedback?: string | null;
          mentor_focus?: string | null;
          reviewed_by?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "internship_check_ins_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "internship_check_ins_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      internship_outcomes: {
        Row: {
          id: string;
          placement_id: string;
          completion_status: Database['public']['Enums']['completion_status'];
          final_score: number | null;
          strengths: string | null;
          development_areas: string | null;
          mentor_recommendation: Database['public']['Enums']['outcome_recommendation'];
          intern_feedback: string | null;
          decided_by: string | null;
          decided_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          completion_status?: Database['public']['Enums']['completion_status'];
          final_score?: number | null;
          strengths?: string | null;
          development_areas?: string | null;
          mentor_recommendation?: Database['public']['Enums']['outcome_recommendation'];
          intern_feedback?: string | null;
          decided_by?: string | null;
          decided_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          completion_status?: Database['public']['Enums']['completion_status'];
          final_score?: number | null;
          strengths?: string | null;
          development_areas?: string | null;
          mentor_recommendation?: Database['public']['Enums']['outcome_recommendation'];
          intern_feedback?: string | null;
          decided_by?: string | null;
          decided_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "internship_outcomes_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: true;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "internship_outcomes_decided_by_fkey";
            columns: ["decided_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      internship_programmes: {
        Row: {
          id: string;
          department_id: string | null;
          name: string;
          code: string;
          cohort_label: string;
          description: string | null;
          programme_type: string;
          start_date: string;
          end_date: string;
          application_open_at: string | null;
          application_close_at: string | null;
          slots: number;
          work_arrangement: Database['public']['Enums']['work_arrangement'];
          expected_hours_per_week: number;
          stipend_enabled: boolean;
          stipend_amount: number | null;
          stipend_currency: string;
          eligibility: Json;
          required_skills: string[];
          learning_objectives: string[];
          mentor_requirements: string | null;
          evaluation_framework: string | null;
          completion_rules: Json;
          required_documents: string[];
          policy_ids: string[];
          industrial_attachment_applicable: boolean;
          regulator_permission_reference: string | null;
          trainer_registration_reference: string | null;
          status: Database['public']['Enums']['programme_status'];
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          department_id?: string | null;
          name: string;
          code: string;
          cohort_label: string;
          description?: string | null;
          programme_type?: string;
          start_date: string;
          end_date: string;
          application_open_at?: string | null;
          application_close_at?: string | null;
          slots?: number;
          work_arrangement?: Database['public']['Enums']['work_arrangement'];
          expected_hours_per_week?: number;
          stipend_enabled?: boolean;
          stipend_amount?: number | null;
          stipend_currency?: string;
          eligibility?: Json;
          required_skills?: string[];
          learning_objectives?: string[];
          mentor_requirements?: string | null;
          evaluation_framework?: string | null;
          completion_rules?: Json;
          required_documents?: string[];
          policy_ids?: string[];
          industrial_attachment_applicable?: boolean;
          regulator_permission_reference?: string | null;
          trainer_registration_reference?: string | null;
          status?: Database['public']['Enums']['programme_status'];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          department_id?: string | null;
          name?: string;
          code?: string;
          cohort_label?: string;
          description?: string | null;
          programme_type?: string;
          start_date?: string;
          end_date?: string;
          application_open_at?: string | null;
          application_close_at?: string | null;
          slots?: number;
          work_arrangement?: Database['public']['Enums']['work_arrangement'];
          expected_hours_per_week?: number;
          stipend_enabled?: boolean;
          stipend_amount?: number | null;
          stipend_currency?: string;
          eligibility?: Json;
          required_skills?: string[];
          learning_objectives?: string[];
          mentor_requirements?: string | null;
          evaluation_framework?: string | null;
          completion_rules?: Json;
          required_documents?: string[];
          policy_ids?: string[];
          industrial_attachment_applicable?: boolean;
          regulator_permission_reference?: string | null;
          trainer_registration_reference?: string | null;
          status?: Database['public']['Enums']['programme_status'];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "internship_programmes_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "internship_programmes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_scores: {
        Row: {
          id: string;
          interview_id: string;
          assessor_id: string;
          criterion: string;
          score: number;
          maximum_score: number;
          comment: string | null;
          evidence_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          assessor_id: string;
          criterion: string;
          score: number;
          maximum_score?: number;
          comment?: string | null;
          evidence_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          assessor_id?: string;
          criterion?: string;
          score?: number;
          maximum_score?: number;
          comment?: string | null;
          evidence_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_scores_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_scores_assessor_id_fkey";
            columns: ["assessor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interviews: {
        Row: {
          id: string;
          application_id: string;
          interview_type: string;
          scheduled_at: string;
          duration_minutes: number;
          location_or_link: string | null;
          panel_ids: string[];
          status: Database['public']['Enums']['interview_status'];
          summary: string | null;
          recording_consent_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          interview_type: string;
          scheduled_at: string;
          duration_minutes?: number;
          location_or_link?: string | null;
          panel_ids?: string[];
          status?: Database['public']['Enums']['interview_status'];
          summary?: string | null;
          recording_consent_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          interview_type?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          location_or_link?: string | null;
          panel_ids?: string[];
          status?: Database['public']['Enums']['interview_status'];
          summary?: string | null;
          recording_consent_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_goals: {
        Row: {
          id: string;
          placement_id: string;
          competency_id: string | null;
          title: string;
          success_measure: string;
          target_date: string | null;
          status: Database['public']['Enums']['goal_status'];
          progress: number;
          intern_reflection: string | null;
          mentor_notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          competency_id?: string | null;
          title: string;
          success_measure: string;
          target_date?: string | null;
          status?: Database['public']['Enums']['goal_status'];
          progress?: number;
          intern_reflection?: string | null;
          mentor_notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          competency_id?: string | null;
          title?: string;
          success_measure?: string;
          target_date?: string | null;
          status?: Database['public']['Enums']['goal_status'];
          progress?: number;
          intern_reflection?: string | null;
          mentor_notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_goals_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_goals_competency_id_fkey";
            columns: ["competency_id"];
            isOneToOne: false;
            referencedRelation: "competencies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_goals_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_resources: {
        Row: {
          id: string;
          programme_id: string | null;
          track_id: string | null;
          competency_id: string | null;
          title: string;
          resource_type: string;
          url: string | null;
          content: string | null;
          duration_minutes: number | null;
          is_required: boolean;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          programme_id?: string | null;
          track_id?: string | null;
          competency_id?: string | null;
          title: string;
          resource_type: string;
          url?: string | null;
          content?: string | null;
          duration_minutes?: number | null;
          is_required?: boolean;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          programme_id?: string | null;
          track_id?: string | null;
          competency_id?: string | null;
          title?: string;
          resource_type?: string;
          url?: string | null;
          content?: string | null;
          duration_minutes?: number | null;
          is_required?: boolean;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_resources_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_resources_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "programme_tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_resources_competency_id_fkey";
            columns: ["competency_id"];
            isOneToOne: false;
            referencedRelation: "competencies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_resources_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      leave_requests: {
        Row: {
          id: string;
          placement_id: string;
          leave_type: string;
          start_date: string;
          end_date: string;
          reason: string;
          status: Database['public']['Enums']['leave_status'];
          decided_by: string | null;
          decision_notes: string | null;
          decided_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          leave_type: string;
          start_date: string;
          end_date: string;
          reason: string;
          status?: Database['public']['Enums']['leave_status'];
          decided_by?: string | null;
          decision_notes?: string | null;
          decided_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          leave_type?: string;
          start_date?: string;
          end_date?: string;
          reason?: string;
          status?: Database['public']['Enums']['leave_status'];
          decided_by?: string | null;
          decision_notes?: string | null;
          decided_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leave_requests_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leave_requests_decided_by_fkey";
            columns: ["decided_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          status: Database['public']['Enums']['task_status'];
          order_index: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: Database['public']['Enums']['task_status'];
          order_index?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: Database['public']['Enums']['task_status'];
          order_index?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          related_type: string | null;
          related_id: string | null;
          action_url: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          related_type?: string | null;
          related_id?: string | null;
          action_url?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          related_type?: string | null;
          related_id?: string | null;
          action_url?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      offers: {
        Row: {
          id: string;
          application_id: string;
          programme_id: string;
          track_id: string | null;
          offered_start_date: string;
          offered_end_date: string;
          work_arrangement: Database['public']['Enums']['work_arrangement'];
          stipend_amount: number | null;
          stipend_currency: string;
          terms: string | null;
          expires_at: string | null;
          status: Database['public']['Enums']['offer_status'];
          sent_at: string | null;
          responded_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          programme_id: string;
          track_id?: string | null;
          offered_start_date: string;
          offered_end_date: string;
          work_arrangement: Database['public']['Enums']['work_arrangement'];
          stipend_amount?: number | null;
          stipend_currency?: string;
          terms?: string | null;
          expires_at?: string | null;
          status?: Database['public']['Enums']['offer_status'];
          sent_at?: string | null;
          responded_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          programme_id?: string;
          track_id?: string | null;
          offered_start_date?: string;
          offered_end_date?: string;
          work_arrangement?: Database['public']['Enums']['work_arrangement'];
          stipend_amount?: number | null;
          stipend_currency?: string;
          terms?: string | null;
          expires_at?: string | null;
          status?: Database['public']['Enums']['offer_status'];
          sent_at?: string | null;
          responded_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offers_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: true;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "programme_tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      onboarding_items: {
        Row: {
          id: string;
          placement_id: string;
          category: string;
          title: string;
          description: string | null;
          is_required: boolean;
          status: Database['public']['Enums']['onboarding_status'];
          due_date: string | null;
          evidence_url: string | null;
          completed_at: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          category: string;
          title: string;
          description?: string | null;
          is_required?: boolean;
          status?: Database['public']['Enums']['onboarding_status'];
          due_date?: string | null;
          evidence_url?: string | null;
          completed_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          category?: string;
          title?: string;
          description?: string | null;
          is_required?: boolean;
          status?: Database['public']['Enums']['onboarding_status'];
          due_date?: string | null;
          evidence_url?: string | null;
          completed_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_items_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "onboarding_items_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      opportunities: {
        Row: {
          id: string;
          programme_id: string;
          track_id: string | null;
          department_id: string | null;
          title: string;
          slug: string;
          summary: string;
          responsibilities: string[];
          qualifications: string[];
          expected_competencies: string[];
          possible_projects: string[];
          work_arrangement: Database['public']['Enums']['work_arrangement'];
          location: string | null;
          slots: number;
          opens_at: string | null;
          closes_at: string | null;
          status: Database['public']['Enums']['opportunity_status'];
          hiring_manager_id: string | null;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          programme_id: string;
          track_id?: string | null;
          department_id?: string | null;
          title: string;
          slug: string;
          summary: string;
          responsibilities?: string[];
          qualifications?: string[];
          expected_competencies?: string[];
          possible_projects?: string[];
          work_arrangement?: Database['public']['Enums']['work_arrangement'];
          location?: string | null;
          slots?: number;
          opens_at?: string | null;
          closes_at?: string | null;
          status?: Database['public']['Enums']['opportunity_status'];
          hiring_manager_id?: string | null;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          programme_id?: string;
          track_id?: string | null;
          department_id?: string | null;
          title?: string;
          slug?: string;
          summary?: string;
          responsibilities?: string[];
          qualifications?: string[];
          expected_competencies?: string[];
          possible_projects?: string[];
          work_arrangement?: Database['public']['Enums']['work_arrangement'];
          location?: string | null;
          slots?: number;
          opens_at?: string | null;
          closes_at?: string | null;
          status?: Database['public']['Enums']['opportunity_status'];
          hiring_manager_id?: string | null;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "opportunities_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "programme_tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_hiring_manager_id_fkey";
            columns: ["hiring_manager_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      placements: {
        Row: {
          id: string;
          intern_id: string;
          application_id: string | null;
          programme_id: string;
          track_id: string | null;
          opportunity_id: string | null;
          primary_mentor_id: string | null;
          supervisor_id: string | null;
          programme_manager_id: string | null;
          start_date: string;
          end_date: string;
          status: Database['public']['Enums']['placement_status'];
          current_phase: string;
          expected_hours: number | null;
          hours_logged: number;
          baseline_notes: string | null;
          risk_level: Database['public']['Enums']['risk_level'];
          risk_updated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          intern_id: string;
          application_id?: string | null;
          programme_id: string;
          track_id?: string | null;
          opportunity_id?: string | null;
          primary_mentor_id?: string | null;
          supervisor_id?: string | null;
          programme_manager_id?: string | null;
          start_date: string;
          end_date: string;
          status?: Database['public']['Enums']['placement_status'];
          current_phase?: string;
          expected_hours?: number | null;
          hours_logged?: number;
          baseline_notes?: string | null;
          risk_level?: Database['public']['Enums']['risk_level'];
          risk_updated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          intern_id?: string;
          application_id?: string | null;
          programme_id?: string;
          track_id?: string | null;
          opportunity_id?: string | null;
          primary_mentor_id?: string | null;
          supervisor_id?: string | null;
          programme_manager_id?: string | null;
          start_date?: string;
          end_date?: string;
          status?: Database['public']['Enums']['placement_status'];
          current_phase?: string;
          expected_hours?: number | null;
          hours_logged?: number;
          baseline_notes?: string | null;
          risk_level?: Database['public']['Enums']['risk_level'];
          risk_updated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "placements_intern_id_fkey";
            columns: ["intern_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "programme_tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_primary_mentor_id_fkey";
            columns: ["primary_mentor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_supervisor_id_fkey";
            columns: ["supervisor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_programme_manager_id_fkey";
            columns: ["programme_manager_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      policies: {
        Row: {
          id: string;
          title: string;
          policy_type: string;
          version: string;
          content: string;
          effective_from: string;
          review_due: string | null;
          is_mandatory: boolean;
          is_published: boolean;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          policy_type: string;
          version: string;
          content: string;
          effective_from: string;
          review_due?: string | null;
          is_mandatory?: boolean;
          is_published?: boolean;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          policy_type?: string;
          version?: string;
          content?: string;
          effective_from?: string;
          review_due?: string | null;
          is_mandatory?: boolean;
          is_published?: boolean;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "policies_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      policy_acknowledgements: {
        Row: {
          policy_id: string;
          profile_id: string;
          acknowledged_at: string;
          ip_hash: string | null;
        };
        Insert: {
          policy_id: string;
          profile_id: string;
          acknowledged_at?: string;
          ip_hash?: string | null;
        };
        Update: {
          policy_id?: string;
          profile_id?: string;
          acknowledged_at?: string;
          ip_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgements_policy_id_fkey";
            columns: ["policy_id"];
            isOneToOne: false;
            referencedRelation: "policies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "policy_acknowledgements_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: Database['public']['Enums']['app_role'];
          avatar_url: string | null;
          phone: string | null;
          timezone: string;
          locale: string;
          is_active: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: Database['public']['Enums']['app_role'];
          avatar_url?: string | null;
          phone?: string | null;
          timezone?: string;
          locale?: string;
          is_active?: boolean;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: Database['public']['Enums']['app_role'];
          avatar_url?: string | null;
          phone?: string | null;
          timezone?: string;
          locale?: string;
          is_active?: boolean;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      programme_competencies: {
        Row: {
          programme_id: string;
          track_id: string | null;
          competency_id: string;
          target_level: number;
          weight: number;
        };
        Insert: {
          programme_id: string;
          track_id?: string | null;
          competency_id: string;
          target_level?: number;
          weight?: number;
        };
        Update: {
          programme_id?: string;
          track_id?: string | null;
          competency_id?: string;
          target_level?: number;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "programme_competencies_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "programme_competencies_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "programme_tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "programme_competencies_competency_id_fkey";
            columns: ["competency_id"];
            isOneToOne: false;
            referencedRelation: "competencies";
            referencedColumns: ["id"];
          },
        ];
      };
      programme_concerns: {
        Row: {
          id: string;
          placement_id: string | null;
          reported_by: string | null;
          category: Database['public']['Enums']['concern_category'];
          summary: string;
          details: string | null;
          status: Database['public']['Enums']['concern_status'];
          is_confidential: boolean;
          is_anonymous: boolean;
          assigned_to: string | null;
          resolution_summary: string | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          placement_id?: string | null;
          reported_by?: string | null;
          category: Database['public']['Enums']['concern_category'];
          summary: string;
          details?: string | null;
          status?: Database['public']['Enums']['concern_status'];
          is_confidential?: boolean;
          is_anonymous?: boolean;
          assigned_to?: string | null;
          resolution_summary?: string | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          placement_id?: string | null;
          reported_by?: string | null;
          category?: Database['public']['Enums']['concern_category'];
          summary?: string;
          details?: string | null;
          status?: Database['public']['Enums']['concern_status'];
          is_confidential?: boolean;
          is_anonymous?: boolean;
          assigned_to?: string | null;
          resolution_summary?: string | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "programme_concerns_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "programme_concerns_reported_by_fkey";
            columns: ["reported_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "programme_concerns_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      programme_events: {
        Row: {
          id: string;
          programme_id: string | null;
          title: string;
          event_type: string;
          description: string | null;
          starts_at: string;
          ends_at: string;
          location_or_link: string | null;
          capacity: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          programme_id?: string | null;
          title: string;
          event_type: string;
          description?: string | null;
          starts_at: string;
          ends_at: string;
          location_or_link?: string | null;
          capacity?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          programme_id?: string | null;
          title?: string;
          event_type?: string;
          description?: string | null;
          starts_at?: string;
          ends_at?: string;
          location_or_link?: string | null;
          capacity?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programme_events_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "programme_events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      programme_tracks: {
        Row: {
          id: string;
          programme_id: string;
          name: string;
          code: string;
          description: string | null;
          capacity: number | null;
          learning_objectives: string[];
          required_skills: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          programme_id: string;
          name: string;
          code: string;
          description?: string | null;
          capacity?: number | null;
          learning_objectives?: string[];
          required_skills?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          programme_id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          capacity?: number | null;
          learning_objectives?: string[];
          required_skills?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programme_tracks_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
        ];
      };
      project_members: {
        Row: {
          project_id: string;
          placement_id: string;
          role_title: string | null;
          allocation_percent: number | null;
          joined_at: string;
          left_at: string | null;
        };
        Insert: {
          project_id: string;
          placement_id: string;
          role_title?: string | null;
          allocation_percent?: number | null;
          joined_at?: string;
          left_at?: string | null;
        };
        Update: {
          project_id?: string;
          placement_id?: string;
          role_title?: string | null;
          allocation_percent?: number | null;
          joined_at?: string;
          left_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          programme_id: string | null;
          track_id: string | null;
          department_id: string | null;
          name: string;
          code: string;
          description: string | null;
          objective: string;
          project_lead_id: string | null;
          repository_url: string | null;
          start_date: string | null;
          target_end_date: string | null;
          status: Database['public']['Enums']['project_status'];
          progress: number;
          is_simulated: boolean;
          confidentiality_level: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          programme_id?: string | null;
          track_id?: string | null;
          department_id?: string | null;
          name: string;
          code: string;
          description?: string | null;
          objective: string;
          project_lead_id?: string | null;
          repository_url?: string | null;
          start_date?: string | null;
          target_end_date?: string | null;
          status?: Database['public']['Enums']['project_status'];
          progress?: number;
          is_simulated?: boolean;
          confidentiality_level?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          programme_id?: string | null;
          track_id?: string | null;
          department_id?: string | null;
          name?: string;
          code?: string;
          description?: string | null;
          objective?: string;
          project_lead_id?: string | null;
          repository_url?: string | null;
          start_date?: string | null;
          target_end_date?: string | null;
          status?: Database['public']['Enums']['project_status'];
          progress?: number;
          is_simulated?: boolean;
          confidentiality_level?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "programme_tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_project_lead_id_fkey";
            columns: ["project_lead_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      risk_signals: {
        Row: {
          id: string;
          placement_id: string;
          level: Database['public']['Enums']['risk_level'];
          signal_type: string;
          reason: string;
          source_record_type: string | null;
          source_record_id: string | null;
          detected_at: string;
          acknowledged_by: string | null;
          acknowledged_at: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          resolution: string | null;
        };
        Insert: {
          id?: string;
          placement_id: string;
          level: Database['public']['Enums']['risk_level'];
          signal_type: string;
          reason: string;
          source_record_type?: string | null;
          source_record_id?: string | null;
          detected_at?: string;
          acknowledged_by?: string | null;
          acknowledged_at?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          resolution?: string | null;
        };
        Update: {
          id?: string;
          placement_id?: string;
          level?: Database['public']['Enums']['risk_level'];
          signal_type?: string;
          reason?: string;
          source_record_type?: string | null;
          source_record_id?: string | null;
          detected_at?: string;
          acknowledged_by?: string | null;
          acknowledged_at?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          resolution?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "risk_signals_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "risk_signals_acknowledged_by_fkey";
            columns: ["acknowledged_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "risk_signals_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      rubric_criteria: {
        Row: {
          id: string;
          rubric_id: string;
          competency_id: string | null;
          name: string;
          description: string | null;
          weight: number;
          descriptors: Json;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          rubric_id: string;
          competency_id?: string | null;
          name: string;
          description?: string | null;
          weight?: number;
          descriptors?: Json;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          rubric_id?: string;
          competency_id?: string | null;
          name?: string;
          description?: string | null;
          weight?: number;
          descriptors?: Json;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rubric_criteria_rubric_id_fkey";
            columns: ["rubric_id"];
            isOneToOne: false;
            referencedRelation: "rubrics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rubric_criteria_competency_id_fkey";
            columns: ["competency_id"];
            isOneToOne: false;
            referencedRelation: "competencies";
            referencedColumns: ["id"];
          },
        ];
      };
      rubrics: {
        Row: {
          id: string;
          programme_id: string | null;
          name: string;
          description: string | null;
          scale_max: number;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          programme_id?: string | null;
          name: string;
          description?: string | null;
          scale_max?: number;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          programme_id?: string | null;
          name?: string;
          description?: string | null;
          scale_max?: number;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rubrics_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "internship_programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rubrics_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stipend_payments: {
        Row: {
          id: string;
          placement_id: string;
          period_start: string;
          period_end: string;
          amount: number;
          currency: string;
          status: Database['public']['Enums']['payment_status'];
          reference: string | null;
          scheduled_at: string | null;
          paid_at: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          period_start: string;
          period_end: string;
          amount: number;
          currency?: string;
          status?: Database['public']['Enums']['payment_status'];
          reference?: string | null;
          scheduled_at?: string | null;
          paid_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          period_start?: string;
          period_end?: string;
          amount?: number;
          currency?: string;
          status?: Database['public']['Enums']['payment_status'];
          reference?: string | null;
          scheduled_at?: string | null;
          paid_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stipend_payments_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stipend_payments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      system_access_resources: {
        Row: {
          id: string;
          name: string;
          category: string;
          owner_id: string | null;
          provision_instructions: string | null;
          revoke_instructions: string | null;
          is_sensitive: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          owner_id?: string | null;
          provision_instructions?: string | null;
          revoke_instructions?: string | null;
          is_sensitive?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          owner_id?: string | null;
          provision_instructions?: string | null;
          revoke_instructions?: string | null;
          is_sensitive?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "system_access_resources_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          author_id: string;
          body: string;
          is_internal_note: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          author_id: string;
          body: string;
          is_internal_note?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          author_id?: string;
          body?: string;
          is_internal_note?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      task_competencies: {
        Row: {
          task_id: string;
          competency_id: string;
          weight: number;
        };
        Insert: {
          task_id: string;
          competency_id: string;
          weight?: number;
        };
        Update: {
          task_id?: string;
          competency_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "task_competencies_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_competencies_competency_id_fkey";
            columns: ["competency_id"];
            isOneToOne: false;
            referencedRelation: "competencies";
            referencedColumns: ["id"];
          },
        ];
      };
      task_dependencies: {
        Row: {
          task_id: string;
          depends_on_task_id: string;
        };
        Insert: {
          task_id: string;
          depends_on_task_id: string;
        };
        Update: {
          task_id?: string;
          depends_on_task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_dependencies_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey";
            columns: ["depends_on_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string | null;
          milestone_id: string | null;
          placement_id: string | null;
          task_number: string;
          title: string;
          description: string | null;
          objective: string | null;
          acceptance_criteria: string[];
          priority: Database['public']['Enums']['priority_level'];
          status: Database['public']['Enums']['task_status'];
          due_at: string | null;
          estimated_hours: number | null;
          actual_hours: number | null;
          assigned_by: string | null;
          submitted_at: string | null;
          reviewed_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          milestone_id?: string | null;
          placement_id?: string | null;
          task_number?: string;
          title: string;
          description?: string | null;
          objective?: string | null;
          acceptance_criteria?: string[];
          priority?: Database['public']['Enums']['priority_level'];
          status?: Database['public']['Enums']['task_status'];
          due_at?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          assigned_by?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          milestone_id?: string | null;
          placement_id?: string | null;
          task_number?: string;
          title?: string;
          description?: string | null;
          objective?: string | null;
          acceptance_criteria?: string[];
          priority?: Database['public']['Enums']['priority_level'];
          status?: Database['public']['Enums']['task_status'];
          due_at?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          assigned_by?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_milestone_id_fkey";
            columns: ["milestone_id"];
            isOneToOne: false;
            referencedRelation: "milestones";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      work_evidence: {
        Row: {
          id: string;
          placement_id: string;
          task_id: string | null;
          learning_goal_id: string | null;
          evidence_type: Database['public']['Enums']['evidence_type'];
          title: string;
          description: string | null;
          url: string | null;
          storage_path: string | null;
          metadata: Json;
          submitted_by: string | null;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          placement_id: string;
          task_id?: string | null;
          learning_goal_id?: string | null;
          evidence_type: Database['public']['Enums']['evidence_type'];
          title: string;
          description?: string | null;
          url?: string | null;
          storage_path?: string | null;
          metadata?: Json;
          submitted_by?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          placement_id?: string;
          task_id?: string | null;
          learning_goal_id?: string | null;
          evidence_type?: Database['public']['Enums']['evidence_type'];
          title?: string;
          description?: string | null;
          url?: string | null;
          storage_path?: string | null;
          metadata?: Json;
          submitted_by?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_evidence_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_evidence_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_evidence_learning_goal_id_fkey";
            columns: ["learning_goal_id"];
            isOneToOne: false;
            referencedRelation: "learning_goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_evidence_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_evidence_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      intern_operating_summary: {
        Row: {
          placement_id: string;
          intern_id: string;
          full_name: string;
          email: string;
          programme_id: string | null;
          programme_name: string | null;
          track_name: string | null;
          current_phase: string | null;
          status: Database['public']['Enums']['placement_status'];
          primary_mentor_id: string | null;
          supervisor_id: string | null;
          start_date: string | null;
          end_date: string | null;
          learning_progress: number;
          attendance_rate: number;
          performance_score: number | null;
          open_tasks: number;
          completed_tasks: number;
          risk_level: Database['public']['Enums']['risk_level'];
        };
        Relationships: [];
      };
      mentor_capacity: {
        Row: {
          mentor_id: string;
          full_name: string;
          email: string;
          active_interns: number;
          high_risk_interns: number;
          check_ins_waiting: number;
        };
        Relationships: [];
      };
      programme_health: {
        Row: {
          programme_id: string;
          name: string;
          cohort_label: string | null;
          status: Database['public']['Enums']['programme_status'];
          active_interns: number;
          completed_interns: number;
          at_risk_interns: number;
          average_score: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      assign_role: {
        Args: { target_profile_id: string; new_role: Database['public']['Enums']['app_role']; reason?: string };
        Returns: Database['public']['Tables']['profiles']['Row'];
      };
      current_app_role: { Args: Record<string, never>; Returns: Database['public']['Enums']['app_role'] };
      is_programme_staff: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      access_assignment_status: 'requested' | 'provisioned' | 'suspended' | 'revoked';
      app_role: 'super_admin' | 'programme_admin' | 'recruiter' | 'mentor' | 'supervisor' | 'intern' | 'alumni' | 'external_reviewer';
      application_status: 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'interview' | 'assessment' | 'selected' | 'waitlisted' | 'rejected' | 'withdrawn';
      asset_assignment_status: 'reserved' | 'issued' | 'returned' | 'lost' | 'damaged';
      attendance_status: 'present' | 'remote' | 'late' | 'excused' | 'absent';
      check_in_status: 'draft' | 'submitted' | 'reviewed';
      completion_status: 'in_progress' | 'eligible' | 'completed' | 'extended' | 'withdrawn' | 'not_completed';
      concern_category: 'workload' | 'conduct' | 'safety' | 'harassment' | 'supervision' | 'access' | 'discrimination' | 'wellbeing' | 'privacy' | 'other';
      concern_status: 'open' | 'triaged' | 'in_review' | 'actioned' | 'resolved' | 'closed';
      data_request_status: 'received' | 'identity_verification' | 'in_progress' | 'completed' | 'partially_completed' | 'declined';
      data_request_type: 'access' | 'correction' | 'objection' | 'restriction' | 'deletion' | 'portability';
      document_status: 'required' | 'submitted' | 'approved' | 'rejected' | 'expired' | 'waived';
      evaluation_status: 'draft' | 'submitted' | 'acknowledged' | 'locked';
      evaluation_type: 'baseline' | 'midpoint' | 'final' | 'project' | 'ad_hoc';
      evidence_type: 'repository' | 'commit' | 'pull_request' | 'design' | 'prototype' | 'document' | 'dataset' | 'notebook' | 'experiment' | 'demo' | 'report' | 'certificate' | 'other';
      feedback_source: 'mentor' | 'supervisor' | 'peer' | 'self' | 'project_lead' | 'client' | 'programme_admin';
      goal_status: 'not_started' | 'in_progress' | 'achieved' | 'at_risk' | 'cancelled';
      insight_status: 'generated' | 'reviewed' | 'accepted' | 'dismissed';
      interview_status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
      leave_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
      offer_status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'withdrawn';
      onboarding_status: 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'waived' | 'rejected';
      opportunity_status: 'draft' | 'published' | 'closed' | 'filled' | 'archived';
      outcome_recommendation: 'none' | 'project_work' | 'apprenticeship' | 'extended_internship' | 'freelance' | 'contract' | 'employment' | 'alumni_only';
      payment_status: 'scheduled' | 'processing' | 'paid' | 'failed' | 'cancelled';
      placement_status: 'preboarding' | 'onboarding' | 'active' | 'paused' | 'completing' | 'completed' | 'extended' | 'withdrawn' | 'terminated';
      priority_level: 'low' | 'medium' | 'high' | 'urgent';
      programme_status: 'draft' | 'planned' | 'open' | 'active' | 'paused' | 'completed' | 'archived';
      project_status: 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';
      risk_level: 'low' | 'medium' | 'high' | 'critical';
      task_status: 'backlog' | 'assigned' | 'in_progress' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'completed' | 'cancelled';
      work_arrangement: 'onsite' | 'hybrid' | 'remote';
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type Views<T extends keyof PublicSchema['Views']> = PublicSchema['Views'][T]['Row'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
