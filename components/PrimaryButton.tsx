import { Button } from './global/Button';

export function PrimaryButton(props: React.ComponentProps<typeof Button>) {
  return <Button variant="primary" className="w-full py-3" {...props} />;
}
