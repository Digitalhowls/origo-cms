import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Download, FileInput, Copy, Trash } from 'lucide-react';
import BlockExportImportDialog from './BlockExportImportDialog';
import { Block } from '@shared/types';

interface BlockActionsMenuProps {
  block: Block;
  pageId: number;
  onDuplicate?: (blockId: string) => void;
  onDelete?: (blockId: string) => void;
  onImportSuccess?: (blockTemplate: any) => void;
}

export function BlockActionsMenu({
  block,
  pageId,
  onDuplicate,
  onDelete,
  onImportSuccess
}: BlockActionsMenuProps) {
  const [showExportImportDialog, setShowExportImportDialog] = useState(false);
  
  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(block.id);
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(block.id);
    }
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowExportImportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            <span>Exportar/Importar</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            <span>Duplicar</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
            <Trash className="h-4 w-4 mr-2" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <BlockExportImportDialog
        open={showExportImportDialog}
        onOpenChange={setShowExportImportDialog}
        blockId={block.id}
        pageId={pageId}
        onImportSuccess={onImportSuccess}
      />
    </>
  );
}

export default BlockActionsMenu;