import { supabase } from '@/lib/supabaseClient';

export const fetchClientsFromDB = async () => {
  if (!supabase) {
    console.error("Supabase client is not initialized. Cannot fetch clients.");
    return [];
  }
  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, email, role, profile, auth_id') 
    .eq('role', 'client');

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  const clientsWithContent = await Promise.all(data.map(async (client) => {
    const { data: processData, error: processError } = await supabase
      .from('processes')
      .select('html_content')
      .eq('user_id', client.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    return {
      ...client,
      content: processError || !processData ? '' : processData.html_content || ''
    };
  }));
  return clientsWithContent;
};

export const addClientToDB = async (newClientData) => {
  if (!supabase) {
    console.error("Supabase client is not initialized. Cannot add client.");
    throw new Error("Supabase client not initialized.");
  }
  
  const clientInsertData = { 
    name: newClientData.name,
    username: newClientData.username,
    email: newClientData.email,
    password: newClientData.password, 
    role: 'client',
    profile: 'client'
  };

  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .insert([clientInsertData])
    .select('id, name, username, email, role, auth_id')
    .single();

  if (dbError) {
    console.error('Error inserting client into DB users table:', dbError);
    throw dbError;
  }
  
  if (dbUser) {
    const { error: processError } = await supabase
      .from('processes')
      .insert([{ 
        user_id: dbUser.id, 
        type: 'default', 
        html_content: '', 
        po:'', ref:'', 
        status:'new', 
        produto:'', 
        codigo:'', 
        cliente: dbUser.id 
      }]);

    if (processError) {
       console.warn('Could not create initial process for client:', processError.message);
    }
    return dbUser;
  }
  return null;
};

export const updateClientInDB = async (clientId, authId, updatedClientData) => {
  if (!supabase) {
    console.error("Supabase client is not initialized. Cannot update client.");
    throw new Error("Supabase client not initialized.");
  }

  let userUpdatePayload = {
    name: updatedClientData.name,
    username: updatedClientData.username,
    email: updatedClientData.email,
  };

  if (updatedClientData.password && updatedClientData.password.trim() !== '') {
    userUpdatePayload.password = updatedClientData.password;
  }

  const { data: updatedUser, error: userUpdateError } = await supabase
    .from('users')
    .update(userUpdatePayload)
    .eq('id', clientId)
    .select('id, name, username, email, role, auth_id')
    .single();

  if (userUpdateError) {
    console.error('Error updating client in users table:', userUpdateError);
    throw userUpdateError;
  }
  
  let passwordWarning = null;
  if (updatedClientData.password && updatedClientData.password.trim() !== '' && authId) {
      passwordWarning = "A senha foi atualizada na tabela local 'users', mas não no sistema de autenticação principal do Supabase (auth.users). Para uma atualização completa da senha de autenticação, seria necessário usar as funções de administrador do Supabase Auth.";
  }


  return { user: updatedUser, passwordWarning };
};

export const deleteClientFromDB = async (clientId, authId) => {
  if (!supabase) {
    console.error("Supabase client is not initialized. Cannot delete client.");
    throw new Error("Supabase client not initialized.");
  }

  const { error: processDeleteError } = await supabase
    .from('processes')
    .delete()
    .eq('user_id', clientId);

  if (processDeleteError) {
    console.error('Error deleting client processes from DB:', processDeleteError);
    
  }

  const { error: dbError } = await supabase
    .from('users')
    .delete()
    .eq('id', clientId);

  if (dbError) {
    console.error('Error deleting client from users table:', dbError);
    throw dbError;
  }

  let authDeletionWarning = null;
  if (authId) {
    authDeletionWarning = "O cliente foi removido da tabela local 'users'. O usuário correspondente no sistema de autenticação principal do Supabase (auth.users), se existir e estiver vinculado por 'auth_id', não foi removido por esta operação. A remoção de 'auth.users' requereria uma chamada separada usando privilégios de administrador do Supabase Auth.";
  }

  return { authDeletionWarning };
};

export const saveContentToProcessDB = async (clientId, newContent) => {
  if (!supabase) {
    console.error("Supabase client is not initialized. Cannot save content.");
    throw new Error("Supabase client not initialized.");
  }
  const { data: existingProcess, error: fetchError } = await supabase
    .from('processes')
    .select('id')
    .eq('user_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { 
      console.error('Error fetching existing process:', fetchError);
      throw fetchError;
  }

  let processError;
  if (existingProcess) {
      const { error } = await supabase
          .from('processes')
          .update({ html_content: newContent, updated_at: new Date().toISOString() })
          .eq('id', existingProcess.id);
      processError = error;
  } else {
      const { error } = await supabase
          .from('processes')
          .insert([{ 
              user_id: clientId, 
              html_content: newContent, 
              type: 'default', 
              po: '', ref: '', status: 'active', produto: '', codigo: '', cliente: clientId 
          }]);
      processError = error;
  }

  if (processError) {
    console.error('Error saving content:', processError);
    throw processError;
  }
};