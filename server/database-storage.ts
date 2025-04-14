import { 
  type Client, 
  type InsertClient, 
  type Service, 
  type InsertService, 
  type Renewal, 
  type InsertRenewal, 
  type Activity, 
  type InsertActivity,
  type RenewalWithRelations,
  type DashboardStats
} from "@shared/schema";
import { db } from "./db";
import { IStorage } from "./storage";

// MySQL storage implementation
export class DatabaseStorage implements IStorage {
  // Client operations
  async getClients(): Promise<Client[]> {
    return db.getClients() as Promise<Client[]>;
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    return db.getClient(id) as Promise<Client | undefined>;
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    return db.createClient(client) as Promise<Client>;
  }
  
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    return db.updateClient(id, client) as Promise<Client | undefined>;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    return db.deleteClient(id);
  }
  
  // Service operations
  async getServices(): Promise<Service[]> {
    return db.getServices() as Promise<Service[]>;
  }
  
  async getService(id: number): Promise<Service | undefined> {
    return db.getService(id) as Promise<Service | undefined>;
  }
  
  async createService(service: InsertService): Promise<Service> {
    return db.createService(service) as Promise<Service>;
  }
  
  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    return db.updateService(id, service) as Promise<Service | undefined>;
  }
  
  async deleteService(id: number): Promise<boolean> {
    return db.deleteService(id);
  }
  
  // Renewal operations
  async getRenewals(): Promise<Renewal[]> {
    return db.getRenewals() as Promise<Renewal[]>;
  }
  
  async getRenewal(id: number): Promise<Renewal | undefined> {
    return db.getRenewal(id) as Promise<Renewal | undefined>;
  }
  
  async getRenewalsByClient(clientId: number): Promise<Renewal[]> {
    return db.getRenewalsByClient(clientId) as Promise<Renewal[]>;
  }
  
  async getRenewalsByService(serviceId: number): Promise<Renewal[]> {
    return db.getRenewalsByService(serviceId) as Promise<Renewal[]>;
  }
  
  async getRenewalsWithRelations(): Promise<RenewalWithRelations[]> {
    const rawRenewals = await db.getRenewalsWithRelations();
    
    return rawRenewals.map(raw => {
      return {
        id: raw.id,
        clientId: raw.clientId,
        serviceId: raw.serviceId,
        startDate: raw.startDate,
        endDate: raw.endDate,
        amount: raw.amount,
        notes: raw.notes || "",
        isPaid: Boolean(raw.isPaid),
        notificationSent: Boolean(raw.isNotified),
        createdAt: raw.createdAt || new Date(),
        client: {
          id: raw.clientId,
          name: raw.clientName,
          email: raw.clientEmail,
          phone: raw.phone || '',
          company: raw.company || '',
          address: raw.address || '',
          gst: raw.gst || '',
          createdAt: raw.createdAt || new Date()
        },
        service: {
          id: raw.serviceId,
          name: raw.serviceName,
          description: raw.serviceDescription,
          defaultPrice: raw.servicePrice || 0,
          defaultDuration: 12, // Default value
          createdAt: raw.createdAt || new Date()
        }
      } as RenewalWithRelations;
    });
  }
  
  async getRenewalWithRelations(id: number): Promise<RenewalWithRelations | undefined> {
    const raw = await db.getRenewalWithRelations(id);
    
    if (!raw) {
      return undefined;
    }
    
    return {
      id: raw.id,
      clientId: raw.clientId,
      serviceId: raw.serviceId,
      startDate: raw.startDate,
      endDate: raw.endDate,
      amount: raw.amount,
      notes: raw.notes || "",
      isPaid: Boolean(raw.isPaid),
      notificationSent: Boolean(raw.isNotified),
      createdAt: raw.createdAt || new Date(),
      client: {
        id: raw.clientId,
        name: raw.clientName,
        email: raw.clientEmail,
        phone: raw.phone || '',
        company: raw.company || '',
        address: raw.address || '',
        gst: raw.gst || '',
        createdAt: raw.createdAt || new Date()
      },
      service: {
        id: raw.serviceId,
        name: raw.serviceName,
        description: raw.serviceDescription,
        defaultPrice: raw.servicePrice || 0,
        defaultDuration: 12, // Default value
        createdAt: raw.createdAt || new Date()
      }
    } as RenewalWithRelations;
  }
  
  async getUpcomingRenewals(days: number = 30): Promise<RenewalWithRelations[]> {
    const rawRenewals = await db.getUpcomingRenewals(days);
    
    return rawRenewals.map(raw => {
      return {
        id: raw.id,
        clientId: raw.clientId,
        serviceId: raw.serviceId,
        startDate: raw.startDate,
        endDate: raw.endDate,
        amount: raw.amount,
        notes: raw.notes || "",
        isPaid: Boolean(raw.isPaid),
        notificationSent: Boolean(raw.isNotified),
        createdAt: raw.createdAt || new Date(),
        client: {
          id: raw.clientId,
          name: raw.clientName,
          email: raw.clientEmail,
          phone: raw.phone || '',
          company: raw.company || '',
          address: raw.address || '',
          gst: raw.gst || '',
          createdAt: raw.createdAt || new Date()
        },
        service: {
          id: raw.serviceId,
          name: raw.serviceName,
          description: raw.serviceDescription,
          defaultPrice: raw.servicePrice || 0,
          defaultDuration: 12, // Default value
          createdAt: raw.createdAt || new Date()
        }
      } as RenewalWithRelations;
    });
  }
  
  async createRenewal(renewal: InsertRenewal): Promise<Renewal> {
    return db.createRenewal(renewal) as Promise<Renewal>;
  }
  
  async updateRenewal(id: number, renewal: Partial<InsertRenewal>): Promise<Renewal | undefined> {
    return db.updateRenewal(id, renewal) as Promise<Renewal | undefined>;
  }
  
  async updateRenewalNotificationStatus(id: number, status: boolean): Promise<void> {
    await db.updateRenewalNotificationStatus(id, status);
  }
  
  async deleteRenewal(id: number): Promise<boolean> {
    return db.deleteRenewal(id);
  }
  
  // Activity operations
  async getActivities(limit?: number): Promise<Activity[]> {
    return db.getActivities(limit) as Promise<Activity[]>;
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return db.getActivity(id) as Promise<Activity | undefined>;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    return db.createActivity(activity) as Promise<Activity>;
  }
  
  // Dashboard operations
  async getDashboardStats(): Promise<DashboardStats> {
    const stats = await db.getDashboardStats();
    
    // Format upcomingRenewals to match RenewalWithRelations structure
    const upcomingRenewals = stats.upcomingRenewals.map(raw => {
      return {
        id: raw.id,
        clientId: raw.clientId,
        serviceId: raw.serviceId,
        startDate: raw.startDate,
        endDate: raw.endDate,
        amount: raw.amount,
        notes: raw.notes || "",
        isPaid: Boolean(raw.isPaid),
        notificationSent: Boolean(raw.isNotified),
        createdAt: raw.createdAt || new Date(),
        client: {
          id: raw.clientId,
          name: raw.clientName,
          email: raw.clientEmail,
          phone: raw.phone || '',
          company: raw.company || '',
          address: raw.address || '',
          gst: raw.gst || '',
          createdAt: raw.createdAt || new Date()
        },
        service: {
          id: raw.serviceId,
          name: raw.serviceName,
          description: raw.serviceDescription,
          defaultPrice: raw.servicePrice || 0,
          defaultDuration: 12, // Default value
          createdAt: raw.createdAt || new Date()
        }
      } as RenewalWithRelations;
    });
    
    return {
      ...stats,
      upcomingRenewals
    } as DashboardStats;
  }
  
  async getMonthlyRevenue(months: number = 6): Promise<{month: string, amount: number}[]> {
    return db.getMonthlyRevenue(months);
  }
}