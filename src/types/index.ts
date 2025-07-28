export type Training = {
  id: string;
  name: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  quota: number;
  registered_count?: number; // Make optional as it will be calculated dynamically
  material?: string; // New field for training material
  created_at: string;
};

export type PaymentMethod = {
  id: string;
  method_name: string;
  account_info: string | null;
  qris_image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Registration = {
  id: string;
  training_id: string;
  full_name: string;
  nim: string;
  class_option: 'A' | 'B' | 'C';
  phone_number: string;
  payment_proof_url: string | null;
  selected_payment_method_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  // Optional: Include joined data for display
  training_name?: string;
  payment_method_name?: string;
};

export type AdminUser = {
  id: string;
  username: string;
  role: 'admin';
};

export type LoginFormProps = {
  onLoginSuccess: () => void;
};

export type RegistrationFormProps = {
  trainings: Training[];
  paymentMethods: PaymentMethod[];
  onSubmitSuccess: () => void;
};

export type TrainingManagementProps = {
  trainings: Training[];
  onUpdate: () => void; // Callback to refresh data
};

export type PaymentMethodManagementProps = {
  paymentMethods: PaymentMethod[];
  onUpdate: () => void;
};

export type RegistrationListProps = {
  registrations: Registration[];
  trainings: Training[]; // Add this line
  onUpdate: () => void;
};

export type EditRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  trainings: Training[]; // Needed for dropdown if editing training
  onSave: (updatedRegistration: Registration) => void;
  onDelete: (registrationId: string) => void;
};
