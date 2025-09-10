import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DepartmentToggleProps {
  department: 'LMP' | 'BMP';
  onDepartmentChange: (department: 'LMP' | 'BMP') => void;
}

export default function DepartmentToggle({ department, onDepartmentChange }: DepartmentToggleProps) {
  return (
    <div className="flex items-center space-x-3 bg-card border rounded-lg p-3 shadow-sm">
      <Label htmlFor="department-toggle" className="text-sm font-medium">
        Training Department:
      </Label>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium transition-colors ${department === 'LMP' ? 'text-primary' : 'text-muted-foreground'}`}>
          LMP
        </span>
        <Switch
          id="department-toggle"
          checked={department === 'BMP'}
          onCheckedChange={(checked) => onDepartmentChange(checked ? 'BMP' : 'LMP')}
          className="data-[state=checked]:bg-success data-[state=unchecked]:bg-primary"
        />
        <span className={`text-sm font-medium transition-colors ${department === 'BMP' ? 'text-success' : 'text-muted-foreground'}`}>
          BMP
        </span>
      </div>
    </div>
  );
}