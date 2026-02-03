
import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your Supabase project settings
const supabaseUrl = (process.env as any).SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = (process.env as any).SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const db = {
  tasks: {
    async getAll() {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async upsert(task: any) {
      const { error } = await supabase.from('tasks').upsert(task);
      if (error) throw error;
    }
  },
  expenses: {
    async getAll() {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) throw error;
      return data;
    },
    async upsert(expense: any) {
      const { error } = await supabase.from('expenses').upsert(expense);
      if (error) throw error;
    }
  },
  timeEntries: {
    async getAll() {
      const { data, error } = await supabase.from('time_entries').select('*');
      if (error) throw error;
      return data;
    },
    async upsert(entry: any) {
      const { error } = await supabase.from('time_entries').upsert(entry);
      if (error) throw error;
    }
  },
  invoices: {
    async getAll() {
      const { data, error } = await supabase.from('invoices').select('*');
      if (error) throw error;
      return data;
    },
    async upsert(invoice: any) {
      const { error } = await supabase.from('invoices').upsert(invoice);
      if (error) throw error;
    }
  }
};