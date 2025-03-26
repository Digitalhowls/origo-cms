import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { generateToken } from '../utils/jwt-helper';

// Get organizations for the current user
export async function getOrganizations(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const organizations = await storage.getUserOrganizations(userId);
    
    res.json(organizations);
  } catch (error) {
    console.error('Error getting organizations:', error);
    res.status(500).json({ message: 'Error al obtener organizaciones' });
  }
}

// Get organization by ID
export async function getOrganization(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Check if the user belongs to this organization
    const userOrganizations = await storage.getUserOrganizations(userId);
    const hasAccess = userOrganizations.some(org => org.id === organizationId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso a esta organización' });
    }
    
    res.json(organization);
  } catch (error) {
    console.error('Error getting organization:', error);
    res.status(500).json({ message: 'Error al obtener la organización' });
  }
}

// Switch to a different organization
export async function switchOrganization(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    console.log(`Intentando cambiar a la organización ${organizationId} para el usuario ${userId}`);
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      console.log(`Organización ${organizationId} no encontrada`);
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Check if the user belongs to this organization
    const userOrganizations = await storage.getUserOrganizations(userId);
    console.log(`Organizaciones del usuario:`, userOrganizations.map(org => org.id));
    
    const hasAccess = userOrganizations.some(org => org.id === organizationId);
    
    if (!hasAccess) {
      console.log(`Usuario ${userId} no tiene acceso a la organización ${organizationId}`);
      return res.status(403).json({ message: 'No tienes acceso a esta organización' });
    }
    
    // Update the session with the new organization ID
    (req.session as any).organizationId = organizationId;
    
    // Also update the current context for this request
    (req as any).currentOrganization = organization;
    
    console.log(`Contexto de organización actualizado: ID=${organizationId}`);
    
    // Actualizar el usuario con el nuevo organizationId
    const updatedUser = await storage.updateUser(userId, { organizationId });
    if (!updatedUser) {
      console.error(`Error al actualizar organizationId en usuario ${userId}`);
      return res.status(500).json({ message: 'Error al cambiar de organización' });
    }
    
    // Generar un nuevo token JWT con el organizationId actualizado
    // Usamos la función de generación de token importada al inicio del archivo
    const newToken = generateToken({ ...updatedUser, organizationId });
    
    // Save the session before responding
    req.session.save((err) => {
      if (err) {
        console.error('Error al guardar la sesión:', err);
        return res.status(500).json({ message: 'Error al cambiar de organización' });
      }
      
      res.json({ 
        message: 'Organización cambiada correctamente',
        organization,
        token: newToken // Devolver el nuevo token para que el cliente lo actualice
      });
    });
  } catch (error) {
    console.error('Error switching organization:', error);
    res.status(500).json({ message: 'Error al cambiar de organización' });
  }
}

// Get organization branding
export async function getBranding(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Extract branding information
    const branding = {
      name: organization.name,
      domain: organization.domain || '',
      subdomain: organization.subdomain || '',
      logo: organization.logo || '',
      favicon: organization.favicon || '',
      colors: organization.colors || {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6',
      },
      typography: organization.typography || {
        fontFamily: 'Inter',
        headings: 'Inter',
      },
    };
    
    res.json(branding);
  } catch (error) {
    console.error('Error getting branding:', error);
    res.status(500).json({ message: 'Error al obtener la configuración de marca' });
  }
}

// Update organization branding
export async function updateBranding(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Validate branding data
    const brandingSchema = z.object({
      name: z.string().min(1).optional(),
      domain: z.string().optional(),
      subdomain: z.string().optional(),
      logo: z.string().optional(),
      favicon: z.string().optional(),
      colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
      }).optional(),
      typography: z.object({
        fontFamily: z.string(),
        headings: z.string(),
      }).optional(),
    });
    
    const validationResult = brandingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de marca inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Update organization
    const updatedOrganization = await storage.updateOrganizationBranding(
      organizationId,
      validationResult.data
    );
    
    // Extract updated branding information
    const branding = {
      name: updatedOrganization?.name,
      domain: updatedOrganization?.domain || '',
      subdomain: updatedOrganization?.subdomain || '',
      logo: updatedOrganization?.logo || '',
      favicon: updatedOrganization?.favicon || '',
      colors: updatedOrganization?.colors || {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6',
      },
      typography: updatedOrganization?.typography || {
        fontFamily: 'Inter',
        headings: 'Inter',
      },
    };
    
    res.json(branding);
  } catch (error) {
    console.error('Error updating branding:', error);
    res.status(500).json({ message: 'Error al actualizar la configuración de marca' });
  }
}

// Update organization by ID (for detailed organization page)
export async function updateOrganization(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Check if the user has admin rights in this organization
    const orgUsers = await storage.getOrganizationUsers(organizationId);
    const userInOrg = orgUsers.find(user => user.id === userId);
    
    if (!userInOrg || userInOrg.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para actualizar esta organización' });
    }
    
    // Validate organization data
    const organizationSchema = z.object({
      name: z.string().min(1, 'El nombre es obligatorio'),
      slug: z.string().min(1, 'El slug es obligatorio').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
      domain: z.string().optional(),
      subdomain: z.string().optional(),
      plan: z.string().optional(),
    });
    
    const validationResult = organizationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de organización inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Check if slug is already taken (but skip if it's the same as current)
    if (validationResult.data.slug !== organization.slug) {
      const existingOrg = await storage.getOrganizationBySlug(validationResult.data.slug);
      if (existingOrg) {
        return res.status(400).json({
          message: 'El identificador (slug) ya está en uso',
          field: 'slug'
        });
      }
    }
    
    // Update organization
    const updatedOrganization = await storage.updateOrganizationBranding(
      organizationId,
      validationResult.data
    );
    
    if (!updatedOrganization) {
      return res.status(500).json({ message: 'No se pudo actualizar la organización' });
    }
    
    res.json({
      message: 'Organización actualizada correctamente',
      organization: updatedOrganization
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Error al actualizar la organización' });
  }
}

// Update organization branding by ID (for detailed organization page)
export async function updateOrganizationBranding(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Check if the user has admin rights in this organization
    const orgUsers = await storage.getOrganizationUsers(organizationId);
    const userInOrg = orgUsers.find(user => user.id === userId);
    
    if (!userInOrg || userInOrg.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para actualizar esta organización' });
    }
    
    // Validate branding data
    const brandingSchema = z.object({
      logo: z.string().optional(),
      favicon: z.string().optional(),
      colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
      }),
      typography: z.object({
        fontFamily: z.string(),
        headings: z.string(),
      }),
    });
    
    const validationResult = brandingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de marca inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Update organization branding
    const updatedOrganization = await storage.updateOrganizationBranding(
      organizationId,
      validationResult.data
    );
    
    if (!updatedOrganization) {
      return res.status(500).json({ message: 'No se pudo actualizar la configuración de marca' });
    }
    
    res.json({
      message: 'Configuración de marca actualizada correctamente',
      branding: {
        logo: updatedOrganization.logo,
        favicon: updatedOrganization.favicon,
        colors: updatedOrganization.colors,
        typography: updatedOrganization.typography
      }
    });
  } catch (error) {
    console.error('Error updating organization branding:', error);
    res.status(500).json({ message: 'Error al actualizar la configuración de marca' });
  }
}

// Check domain availability
export async function checkDomain(req: Request, res: Response) {
  try {
    const domainSchema = z.object({
      domain: z.string().min(1),
      type: z.enum(['slug', 'domain', 'subdomain']).default('slug')
    });
    
    const validationResult = domainSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Parámetros inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const { domain, type } = validationResult.data;
    
    let isAvailable = false;
    let existingOrg = null;
    
    // Verificar disponibilidad según el tipo
    if (type === 'slug') {
      existingOrg = await storage.getOrganizationBySlug(domain);
      isAvailable = !existingOrg;
    } else if (type === 'domain') {
      // Verificar si el dominio personalizado ya está en uso
      existingOrg = await storage.getOrganizationByCustomDomain(domain);
      isAvailable = !existingOrg;
      
      // Verificar que el formato del dominio sea válido
      const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return res.status(400).json({
          message: 'Formato de dominio inválido',
          valid: false,
          available: false
        });
      }
    } else if (type === 'subdomain') {
      // Verificar si el subdominio ya está en uso
      existingOrg = await storage.getOrganizationBySubdomain(domain);
      isAvailable = !existingOrg;
      
      // Verificar que el formato del subdominio sea válido
      const subdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/;
      if (!subdomainRegex.test(domain)) {
        return res.status(400).json({
          message: 'Formato de subdominio inválido',
          valid: false,
          available: false
        });
      }
    }
    
    res.json({
      domain,
      type,
      available: isAvailable,
      valid: true
    });
  } catch (error) {
    console.error('Error checking domain:', error);
    res.status(500).json({ message: 'Error al verificar disponibilidad del dominio' });
  }
}

// Verify domain DNS settings
export async function verifyDomain(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    // Validar los datos recibidos
    const verifySchema = z.object({
      domain: z.string().min(1, 'El dominio es obligatorio'),
      organizationId: z.number().optional()
    });
    
    const validationResult = verifySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const { domain, organizationId: requestedOrgId } = validationResult.data;
    
    const userId = (req.user as any).id;
    const currentOrgId = requestedOrgId || (req.user as any).organizationId;
    
    // Verificar que el usuario tenga permisos para esta operación
    const hasPermission = await storage.hasPermission(userId, 'organization', 'update');
    if (!hasPermission) {
      return res.status(403).json({ message: 'No tiene permisos para verificar el dominio de la organización' });
    }
    
    // Obtener la organización actual
    const organization = await storage.getOrganization(currentOrgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    if (!organization.domain || organization.domain !== domain) {
      return res.status(400).json({ message: 'Este dominio no está configurado para esta organización' });
    }
    
    const domainConfig = organization.domainConfig || {};
    const verificationToken = domainConfig.verificationToken;
    
    if (!verificationToken) {
      return res.status(400).json({ message: 'No hay un token de verificación configurado para este dominio' });
    }
    
    // En una implementación real, aquí verificaríamos si el registro DNS TXT está configurado correctamente
    // Para esto, usamos el módulo dns nativo de Node.js para verificar los registros TXT
    // Primero verificamos si ya está marcado como verificado en la configuración
    if (domainConfig.verified) {
      // Generamos instrucciones de DNS específicas para el dominio ya verificado
      const dnsInstructions = {
        title: 'Configuración de DNS actual',
        description: `Tu dominio ${domain} ya está verificado correctamente. Verifica que tengas configurados estos registros DNS para que tu dominio apunte a nuestros servidores:`,
        dns_records: [
          {
            type: 'A',
            host: '@',
            value: '162.159.152.4',
            description: 'Registro A para el dominio raíz'
          },
          {
            type: 'A',
            host: '@',
            value: '162.159.153.4',
            description: 'Registro A secundario para balanceo de carga'
          },
          {
            type: 'CNAME',
            host: 'www',
            value: domain,
            description: 'Registro CNAME para redireccionar www a la raíz del dominio'
          }
        ],
        providers: {
          cloudflare: {
            steps: [
              'En el panel de Cloudflare, ve a la sección DNS',
              'Selecciona "Añadir registro" y crea los registros A y CNAME mencionados',
              'Asegúrate de que el proxy de Cloudflare (el icono naranja de nube) esté activado para aprovechar su CDN'
            ]
          },
          godaddy: {
            steps: [
              'En el panel de GoDaddy, ve a "DNS Management"',
              'Añade los registros A y CNAME en la sección "Records"',
              'Para registros A, usa @ como Host y los valores IP proporcionados',
              'Para el CNAME, usa www como Host y el dominio raíz como Value'
            ]
          },
          general: {
            steps: [
              'Accede al panel de control de DNS de tu proveedor',
              'Crea dos registros A para el dominio raíz (@) con las IPs proporcionadas',
              'Crea un registro CNAME para "www" que apunte a tu dominio raíz',
              'Espera a que se propaguen los cambios (puede tardar hasta 48 horas)'
            ]
          }
        }
      };
      
      return res.json({
        success: true,
        verified: true,
        message: 'El dominio ya está verificado',
        organization,
        dns_setup: dnsInstructions
      });
    }
    
    // Implementación real de verificación de DNS
    const dns = require('dns');
    const { promisify } = require('util');
    const resolveTxt = promisify(dns.resolveTxt);
    
    let verificationSuccessful = false;
    
    try {
      console.log(`Verificando registros DNS para dominio ${domain} con token ${verificationToken}`);
      
      // Intentamos verificar primero con el prefijo _origo-verify
      try {
        const prefixRecords = await resolveTxt(`_origo-verify.${domain}`);
        console.log('Registros DNS TXT encontrados en _origo-verify:', prefixRecords);
        
        // Verificamos si alguno de los registros contiene el token
        verificationSuccessful = prefixRecords.some(record => 
          record.some(txtValue => txtValue.includes(verificationToken))
        );
        
        if (verificationSuccessful) {
          console.log('Verificación exitosa en _origo-verify');
          return;
        }
      } catch (prefixError) {
        console.log('No se encontraron registros TXT en _origo-verify:', prefixError.message);
      }
      
      // Si no se encuentra con el prefijo, intentamos verificar en el dominio raíz
      const rootRecords = await resolveTxt(domain);
      console.log('Registros DNS TXT encontrados en raíz:', rootRecords);
      
      // Verificamos si alguno de los registros contiene el token
      verificationSuccessful = rootRecords.some(record => 
        record.some(txtValue => txtValue.includes(verificationToken))
      );
      
      if (verificationSuccessful) {
        console.log('Verificación exitosa en dominio raíz');
      }
    } catch (dnsError) {
      console.error('Error al verificar registros DNS TXT:', dnsError);
      verificationSuccessful = false;
    }
    
    if (verificationSuccessful) {
      // Actualizar la configuración del dominio como verificado
      const updatedDomainConfig = {
        ...domainConfig,
        verified: true,
        verifiedAt: new Date().toISOString()
      };
      
      // Actualizar la organización con la nueva configuración de dominio
      const updatedOrg = await storage.updateOrganizationDomains(
        currentOrgId,
        {
          domain,
          domainConfig: updatedDomainConfig
        }
      );
      
      // Generamos instrucciones de DNS específicas para el dominio verificado
      const dnsInstructions = {
        title: 'Configuración de DNS adicional',
        description: `Tu dominio ${domain} ha sido verificado correctamente. Ahora debes configurar los siguientes registros DNS para que tu dominio apunte a nuestros servidores:`,
        dns_records: [
          {
            type: 'A',
            host: '@',
            value: '162.159.152.4',
            description: 'Registro A para el dominio raíz'
          },
          {
            type: 'A',
            host: '@',
            value: '162.159.153.4',
            description: 'Registro A secundario para balanceo de carga'
          },
          {
            type: 'CNAME',
            host: 'www',
            value: domain,
            description: 'Registro CNAME para redireccionar www a la raíz del dominio'
          }
        ],
        providers: {
          cloudflare: {
            steps: [
              'En el panel de Cloudflare, ve a la sección DNS',
              'Selecciona "Añadir registro" y crea los registros A y CNAME mencionados',
              'Asegúrate de que el proxy de Cloudflare (el icono naranja de nube) esté activado para aprovechar su CDN'
            ]
          },
          godaddy: {
            steps: [
              'En el panel de GoDaddy, ve a "DNS Management"',
              'Añade los registros A y CNAME en la sección "Records"',
              'Para registros A, usa @ como Host y los valores IP proporcionados',
              'Para el CNAME, usa www como Host y el dominio raíz como Value'
            ]
          },
          general: {
            steps: [
              'Accede al panel de control de DNS de tu proveedor',
              'Crea dos registros A para el dominio raíz (@) con las IPs proporcionadas',
              'Crea un registro CNAME para "www" que apunte a tu dominio raíz',
              'Espera a que se propaguen los cambios (puede tardar hasta 48 horas)'
            ]
          }
        }
      };
      
      res.json({
        success: true,
        verified: true,
        message: '¡Dominio verificado correctamente!',
        organization: updatedOrg,
        dns_setup: dnsInstructions
      });
    } else {
      // Actualizar el timestamp del último intento de verificación
      const updatedDomainConfig = {
        ...domainConfig,
        lastVerificationAttempt: new Date().toISOString()
      };
      
      // Actualizar la organización con la nueva configuración de dominio
      await storage.updateOrganizationDomains(
        currentOrgId,
        {
          domain,
          domainConfig: updatedDomainConfig
        }
      );
      
      res.json({
        success: false,
        verified: false,
        message: 'No se pudo verificar el dominio. Por favor, asegúrese de haber configurado correctamente el registro DNS TXT.',
        instructions: {
          title: 'Error de verificación de dominio',
          description: 'No se pudo verificar tu dominio. Por favor, asegúrate de que has configurado correctamente el registro TXT en tu proveedor de DNS y que los cambios se han propagado.',
          options: [
            {
              title: 'Opción 1: Registro TXT en el subdominio especial (Recomendado)',
              steps: [
                'Inicia sesión en el panel de control de tu proveedor de DNS',
                `Crea un nuevo registro TXT con el nombre/host: _origo-verify`,
                `Establece el valor/contenido: ${verificationToken}`,
                'Guarda los cambios y espera unos minutos para que se propaguen (puede tardar hasta 48 horas en algunos proveedores)'
              ]
            },
            {
              title: 'Opción 2: Registro TXT en el dominio principal',
              steps: [
                'Inicia sesión en el panel de control de tu proveedor de DNS',
                `Crea un nuevo registro TXT con el nombre/host: @ (dominio raíz)`,
                `Establece el valor/contenido: ${verificationToken}`,
                'Guarda los cambios y espera unos minutos para que se propaguen (puede tardar hasta 48 horas en algunos proveedores)'
              ]
            }
          ],
          providers: {
            cloudflare: 'DNS → Añadir registro → Selecciona TXT → Nombre: _origo-verify o @ → Contenido: ' + verificationToken.substring(0, 10) + '... → TTL: Auto',
            godaddy: 'DNS Management → Add → Type: TXT → Name: _origo-verify o @ → Value: ' + verificationToken.substring(0, 10) + '... → TTL: 1 Hour',
            namecheap: 'Advanced DNS → Add New Record → Type: TXT Record → Host: _origo-verify o @ → Value: ' + verificationToken.substring(0, 10) + '... → TTL: Automatic',
            googleDomains: 'DNS → Resource Records → Create → Resource Type: TXT → Name: _origo-verify o @ → Contents: ' + verificationToken.substring(0, 10) + '... → TTL: 1h',
            plesk: 'Domains → example.com → DNS Settings → Add Record → Type: TXT → Record: _origo-verify o @ → Value: ' + verificationToken.substring(0, 10) + '...',
            cpanel: 'Domains → Zone Editor → Manage → Add Record → Type: TXT → Name: _origo-verify o @ → Record: ' + verificationToken.substring(0, 10) + '...'
          },
          verification_tips: [
            'Asegúrate de usar el formato exacto para el registro TXT, sin espacios adicionales',
            'Algunos proveedores DNS requieren que elimines el nombre de dominio del registro (usa solo "_origo-verify" en lugar de "_origo-verify.tudominio.com")',
            'Puedes verificar si tus registros DNS están configurados correctamente usando herramientas como "dig" o sitios web como dnschecker.org o mxtoolbox.com',
            'Si has esperado más de 48 horas y aún no puedes verificar tu dominio, contacta a soporte'
          ]
        }
      });
    }
  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(500).json({ message: 'Error al verificar el dominio' });
  }
}

// Configure custom domain
export async function configureCustomDomain(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    // Validar los datos recibidos
    const domainSchema = z.object({
      domain: z.string().min(1, 'El dominio es obligatorio'),
      organizationId: z.number().optional()
    });
    
    const validationResult = domainSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const { domain, organizationId: requestedOrgId } = validationResult.data;
    
    const userId = (req.user as any).id;
    const currentOrgId = requestedOrgId || (req.user as any).organizationId;
    
    // Verificar que el usuario tenga permisos para esta operación
    const hasPermission = await storage.hasPermission(userId, 'organization', 'update');
    if (!hasPermission) {
      return res.status(403).json({ message: 'No tiene permisos para actualizar la configuración de la organización' });
    }
    
    // Obtener la organización actual
    const organization = await storage.getOrganization(currentOrgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Verificar disponibilidad del dominio personalizado
    const existingOrg = await storage.getOrganizationByCustomDomain(domain);
    if (existingOrg && existingOrg.id !== currentOrgId) {
      return res.status(400).json({ 
        message: 'Este dominio ya está en uso por otra organización' 
      });
    }
    
    // Validar el formato del dominio
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        message: 'Formato de dominio inválido',
        valid: false
      });
    }
    
    // Generar token de verificación DNS
    const verificationToken = `origo-verify-${Math.random().toString(36).substring(2, 15)}`;
    
    // Actualizar o crear configuración de dominio
    const domainConfig = {
      enabled: true,
      verificationMethod: 'dns',
      verificationToken,
      verified: false, // Por defecto no está verificado
      lastVerificationAttempt: new Date().toISOString()
    };
    
    // Utilizamos DNS real para intentar verificar el dominio de forma automática
    // Intentamos verificar si ya hay un registro TXT configurado
    const dns = require('dns');
    const { promisify } = require('util');
    const resolveTxt = promisify(dns.resolveTxt);
    
    // Primero, actualizamos la organización con la configuración de dominio
    const updatedOrg = await storage.updateOrganizationDomains(
      currentOrgId, 
      { 
        domain, 
        domainConfig 
      }
    );
    
    // Intentamos verificar si ya existe un registro TXT para este dominio
    let isPreVerified = false;
    
    try {
      console.log(`Verificando si ya existen registros DNS TXT para: ${domain}`);
      
      // Intentamos consultar registros TXT del dominio
      try {
        const prefixRecords = await resolveTxt(`_origo-verify.${domain}`);
        console.log('Registros TXT existentes en _origo-verify:', prefixRecords);
        
        // Si ya hay algún registro que coincida con nuestro token (poco probable pero posible)
        isPreVerified = prefixRecords.some(record => 
          record.some(txtValue => txtValue.includes(verificationToken))
        );
      } catch (prefixError) {
        console.log('No hay registros TXT en _origo-verify.', prefixError.message);
      }
      
      if (!isPreVerified) {
        // También verificamos en el dominio raíz
        try {
          const rootRecords = await resolveTxt(domain);
          console.log('Registros TXT existentes en dominio raíz:', rootRecords);
          
          // Verificamos si alguno coincide con nuestro token
          isPreVerified = rootRecords.some(record => 
            record.some(txtValue => txtValue.includes(verificationToken))
          );
        } catch (rootError) {
          console.log('No hay registros TXT en el dominio raíz.', rootError.message);
        }
      }
    } catch (dnsError) {
      console.error('Error al verificar registros DNS existentes:', dnsError);
    }
    
    // Si ya hemos detectado que el dominio está verificado, actualizamos el estado
    if (isPreVerified) {
      // Actualizar la configuración como verificada
      const verifiedDomainConfig = {
        ...domainConfig,
        verified: true,
        verifiedAt: new Date().toISOString()
      };
      
      // Actualizar la organización con la nueva configuración de dominio
      const verifiedOrg = await storage.updateOrganizationDomains(
        currentOrgId,
        {
          domain,
          domainConfig: verifiedDomainConfig
        }
      );
      
      // Generamos instrucciones de DNS específicas para el dominio verificado
      const dnsInstructions = {
        title: 'Configuración de DNS adicional',
        description: `Tu dominio ${domain} ha sido verificado correctamente. Ahora debes configurar los siguientes registros DNS para que tu dominio apunte a nuestros servidores:`,
        dns_records: [
          {
            type: 'A',
            host: '@',
            value: '162.159.152.4',
            description: 'Registro A para el dominio raíz'
          },
          {
            type: 'A',
            host: '@',
            value: '162.159.153.4',
            description: 'Registro A secundario para balanceo de carga'
          },
          {
            type: 'CNAME',
            host: 'www',
            value: domain,
            description: 'Registro CNAME para redireccionar www a la raíz del dominio'
          }
        ],
        providers: {
          cloudflare: {
            steps: [
              'En el panel de Cloudflare, ve a la sección DNS',
              'Selecciona "Añadir registro" y crea los registros A y CNAME mencionados',
              'Asegúrate de que el proxy de Cloudflare (el icono naranja de nube) esté activado para aprovechar su CDN'
            ]
          },
          godaddy: {
            steps: [
              'En el panel de GoDaddy, ve a "DNS Management"',
              'Añade los registros A y CNAME en la sección "Records"',
              'Para registros A, usa @ como Host y los valores IP proporcionados',
              'Para el CNAME, usa www como Host y el dominio raíz como Value'
            ]
          },
          general: {
            steps: [
              'Accede al panel de control de DNS de tu proveedor',
              'Crea dos registros A para el dominio raíz (@) con las IPs proporcionadas',
              'Crea un registro CNAME para "www" que apunte a tu dominio raíz',
              'Espera a que se propaguen los cambios (puede tardar hasta 48 horas)'
            ]
          }
        }
      };
      
      res.json({
        success: true,
        verified: true,
        verificationToken,
        domain,
        message: '¡Dominio verificado automáticamente!',
        organization: verifiedOrg,
        dns_setup: dnsInstructions
      });
    } else {
      // El dominio necesita verificación manual
      res.json({
        success: true,
        verified: false,
        verificationToken,
        domain,
        organization: updatedOrg,
        message: 'Configuración de dominio iniciada. Por favor, sigue las instrucciones para verificar tu dominio.',
        instructions: {
          title: 'Verificación de dominio',
          description: 'Para verificar la propiedad de tu dominio, necesitas añadir un registro TXT en tu proveedor de DNS. Sigue estas instrucciones para completar la verificación:',
          options: [
            {
              title: 'Opción 1: Registro TXT en el subdominio especial (Recomendado)',
              steps: [
                'Inicia sesión en el panel de control de tu proveedor de DNS',
                `Crea un nuevo registro TXT con el nombre/host: _origo-verify`,
                `Establece el valor/contenido: ${verificationToken}`,
                'Guarda los cambios y espera unos minutos para que se propaguen (puede tardar hasta 48 horas en algunos proveedores)'
              ]
            },
            {
              title: 'Opción 2: Registro TXT en el dominio principal',
              steps: [
                'Inicia sesión en el panel de control de tu proveedor de DNS',
                `Crea un nuevo registro TXT con el nombre/host: @ (dominio raíz)`,
                `Establece el valor/contenido: ${verificationToken}`,
                'Guarda los cambios y espera unos minutos para que se propaguen (puede tardar hasta 48 horas en algunos proveedores)'
              ]
            }
          ],
          providers: {
            cloudflare: 'DNS → Añadir registro → Selecciona TXT → Nombre: _origo-verify o @ → Contenido: ' + verificationToken.substring(0, 10) + '... → TTL: Auto',
            godaddy: 'DNS Management → Add → Type: TXT → Name: _origo-verify o @ → Value: ' + verificationToken.substring(0, 10) + '... → TTL: 1 Hour',
            namecheap: 'Advanced DNS → Add New Record → Type: TXT Record → Host: _origo-verify o @ → Value: ' + verificationToken.substring(0, 10) + '... → TTL: Automatic',
            googleDomains: 'DNS → Resource Records → Create → Resource Type: TXT → Name: _origo-verify o @ → Contents: ' + verificationToken.substring(0, 10) + '... → TTL: 1h',
            plesk: 'Domains → example.com → DNS Settings → Add Record → Type: TXT → Record: _origo-verify o @ → Value: ' + verificationToken.substring(0, 10) + '...',
            cpanel: 'Domains → Zone Editor → Manage → Add Record → Type: TXT → Name: _origo-verify o @ → Record: ' + verificationToken.substring(0, 10) + '...'
          },
          verification_tips: [
            'Los cambios DNS pueden tardar entre unos minutos y 48 horas en propagarse por internet',
            'Si usas un subdominio (_origo-verify), asegúrate de no añadir tu dominio después (solo "_origo-verify", no "_origo-verify.tudominio.com")',
            'El valor del registro TXT debe ser exactamente igual al token proporcionado, sin espacios adicionales',
            'Puedes verificar la propagación de tus registros DNS en dnschecker.org o mxtoolbox.com'
          ]
        }
      });
    }
  } catch (error) {
    console.error('Error configuring custom domain:', error);
    res.status(500).json({ message: 'Error al configurar el dominio personalizado' });
  }
}

// Create a new organization
export async function createOrganization(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    
    // Validate organization data
    const organizationSchema = z.object({
      name: z.string().min(1, 'El nombre es obligatorio'),
      slug: z.string().min(1, 'El slug es obligatorio').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
      domain: z.string().optional(),
      subdomain: z.string().optional(),
      plan: z.string().optional(),
      logo: z.string().optional(),
      favicon: z.string().optional(),
      colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
      }).optional(),
      typography: z.object({
        fontFamily: z.string(),
        headings: z.string(),
      }).optional(),
    });
    
    const validationResult = organizationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de organización inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Check if slug is already taken
    const existingOrg = await storage.getOrganizationBySlug(validationResult.data.slug);
    if (existingOrg) {
      return res.status(400).json({
        message: 'El identificador (slug) ya está en uso',
        field: 'slug'
      });
    }
    
    // Create organization
    const organization = await storage.createOrganization(validationResult.data, userId);
    
    // Set the new organization as the current one for the user
    (req.user as any).organizationId = organization.id;
    
    res.status(201).json({
      message: 'Organización creada correctamente',
      organization
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Error al crear la organización' });
  }
}

// Delete an organization
export async function deleteOrganization(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Check if the user has admin rights in this organization
    const orgUsers = await storage.getOrganizationUsers(organizationId);
    const userInOrg = orgUsers.find(user => user.id === userId);
    
    if (!userInOrg || userInOrg.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para eliminar esta organización' });
    }
    
    // Get all organizations the user belongs to
    const userOrganizations = await storage.getUserOrganizations(userId);
    
    // Check if this is the only organization for the user
    if (userOrganizations.length <= 1) {
      return res.status(400).json({ message: 'No puedes eliminar tu única organización' });
    }
    
    // Delete the organization
    const deleted = await storage.deleteOrganization(organizationId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'No se pudo eliminar la organización' });
    }
    
    // If the deleted organization was the current one for the user, switch to another organization
    if ((req.user as any).organizationId === organizationId) {
      // Find another organization to switch to
      const newOrg = userOrganizations.find(org => org.id !== organizationId);
      if (newOrg) {
        (req.user as any).organizationId = newOrg.id;
      }
    }
    
    res.json({
      message: 'Organización eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Error al eliminar la organización' });
  }
}

// Get organization users
export async function getOrganizationUsers(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Get users
    const users = await storage.getOrganizationUsers(organizationId);
    
    // Remove password from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Error getting organization users:', error);
    res.status(500).json({ message: 'Error al obtener usuarios de la organización' });
  }
}
