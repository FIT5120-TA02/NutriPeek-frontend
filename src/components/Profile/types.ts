/**
 * Profile component types
 */

export interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  avatarNumber: number;
}

export interface ProfileFormProps {
  onAddChild: (child: ChildProfile) => void;
}

export interface ProfileCardProps {
  child: ChildProfile;
  onEdit: () => void;
  onDelete: () => void;
  isEditing?: boolean;
  onSave?: (updatedChild: ChildProfile) => void;
}

export interface ProfileListProps {
  children: ChildProfile[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onClearAll: () => void;
  editingIndex?: number | null;
  onSave?: (updatedChild: ChildProfile) => void;
}

export interface AvatarSelectorProps {
  gender: string;
  selectedAvatar: number;
  onSelect: (avatarNumber: number) => void;
}

export interface EditProfileFormProps {
  child: ChildProfile;
  onSave: (updatedChild: ChildProfile) => void;
  onCancel: () => void;
} 