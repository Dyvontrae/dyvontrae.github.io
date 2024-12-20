import { useState } from 'react';

interface ModalState {
  isOpen: boolean;
  type: string | null;
  title: string;
  content: any;
}

export function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
    title: '',
    content: null
  });
  
  const openModal = (type: string, title: string, content: any) => {
    setModalState({
      isOpen: true,
      type,
      title,
      content
    });
  };
  
  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      title: '',
      content: null
    });
  };
  
  return {
    modalState,
    openModal,
    closeModal
  };
}