import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  setLoading,
  setGlobalLoading,
  clearLoading,
  clearAllLoading,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  removeNotification,
  clearNotifications,
  selectGlobalLoading,
  selectNotifications,
  selectIsAnyLoading,
  selectTheme,
  selectSidebarOpen,
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
} from '@/store/slices/uiSlice';

/**
 * Hook personalizado para gerenciar estado da UI, loading e notificações
 */
export const useUI = () => {
  const dispatch = useDispatch();
  
  // Seletores
  const theme = useSelector(selectTheme);
  const sidebarOpen = useSelector(selectSidebarOpen);
  const globalLoading = useSelector(selectGlobalLoading);
  const notifications = useSelector(selectNotifications);
  const isAnyLoading = useSelector(selectIsAnyLoading);

  // Funções de loading
  const startLoading = useCallback((key: string) => {
    dispatch(setLoading({ key, loading: true }));
  }, [dispatch]);

  const stopLoading = useCallback((key: string) => {
    dispatch(setLoading({ key, loading: false }));
  }, [dispatch]);

  const loadingState = useSelector((state: RootState) => state.ui.loading);
  
  const isLoading = useCallback((key: string) => {
    return loadingState[key] || false;
  }, [loadingState]);

  const startGlobalLoading = useCallback(() => {
    dispatch(setGlobalLoading(true));
  }, [dispatch]);

  const stopGlobalLoading = useCallback(() => {
    dispatch(setGlobalLoading(false));
  }, [dispatch]);

  const clearLoadingState = useCallback((key: string) => {
    dispatch(clearLoading(key));
  }, [dispatch]);

  const clearAllLoadingStates = useCallback(() => {
    dispatch(clearAllLoading());
  }, [dispatch]);

  // Funções de notificação
  const notifySuccess = useCallback((title: string, message?: string) => {
    dispatch(showSuccess({ title, message }));
  }, [dispatch]);

  const notifyError = useCallback((title: string, message?: string) => {
    dispatch(showError({ title, message }));
  }, [dispatch]);

  const notifyWarning = useCallback((title: string, message?: string) => {
    dispatch(showWarning({ title, message }));
  }, [dispatch]);

  const notifyInfo = useCallback((title: string, message?: string) => {
    dispatch(showInfo({ title, message }));
  }, [dispatch]);

  const dismissNotification = useCallback((id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  // Funções de tema e sidebar
  const switchTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const toggleSidebarState = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const setSidebarState = useCallback((open: boolean) => {
    dispatch(setSidebarOpen(open));
  }, [dispatch]);

  return {
    // Estado
    theme,
    sidebarOpen,
    globalLoading,
    notifications,
    isAnyLoading,
    
    // Loading
    startLoading,
    stopLoading,
    isLoading,
    startGlobalLoading,
    stopGlobalLoading,
    clearLoadingState,
    clearAllLoadingStates,
    
    // Notificações
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    dismissNotification,
    clearAllNotifications,
    
    // UI
    switchTheme,
    toggleSidebarState,
    setSidebarState,
  };
};

/**
 * Hook para operações assíncronas com loading automático
 */
export const useAsyncOperation = () => {
  const { startLoading, stopLoading, notifyError, notifySuccess } = useUI();

  const executeWithLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      loadingKey: string;
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<T | null> => {
    const { loadingKey, successMessage, errorMessage, onSuccess, onError } = options;
    
    try {
      startLoading(loadingKey);
      const result = await operation();
      
      if (successMessage) {
        notifySuccess('Sucesso', successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage) {
        notifyError('Erro', errorMessage);
      } else {
        notifyError('Erro', errorMsg);
      }
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMsg));
      }
      
      return null;
    } finally {
      stopLoading(loadingKey);
    }
  }, [startLoading, stopLoading, notifyError, notifySuccess]);

  return { executeWithLoading };
};

/**
 * Hook para gerenciar estado de formulários com loading e validação
 */
export const useFormState = <T extends Record<string, any>>(initialState: T) => {
  const [formData, setFormData] = React.useState<T>(initialState);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});
  const { executeWithLoading } = useAsyncOperation();

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpa erro quando campo é alterado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const touchField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  const submitForm = useCallback(async (
    submitFn: (data: T) => Promise<any>,
    options?: {
      loadingKey?: string;
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: any) => void;
      resetOnSuccess?: boolean;
    }
  ) => {
    const {
      loadingKey = 'form-submit',
      successMessage,
      errorMessage,
      onSuccess,
      resetOnSuccess = false
    } = options || {};

    const result = await executeWithLoading(
      () => submitFn(formData),
      {
        loadingKey,
        successMessage,
        errorMessage,
        onSuccess: (result) => {
          if (resetOnSuccess) {
            resetForm();
          }
          if (onSuccess) {
            onSuccess(result);
          }
        },
      }
    );

    return result;
  }, [formData, executeWithLoading, resetForm]);

  const hasErrors = Object.values(errors).some(error => !!error);
  const isFieldTouched = (field: keyof T) => touched[field] || false;
  const getFieldError = (field: keyof T) => errors[field];

  return {
    formData,
    errors,
    touched,
    hasErrors,
    updateField,
    touchField,
    setFieldError,
    clearErrors,
    resetForm,
    submitForm,
    isFieldTouched,
    getFieldError,
  };
};