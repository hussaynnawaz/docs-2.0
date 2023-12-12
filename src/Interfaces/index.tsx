interface TopbarProps {
  photoURL: string;
  setIsEdit?: Function;
}

interface DropdownProps {
  children: React.ReactNode;
}


interface functionInterface {
  id: string;
  handleEdit: () => void;
}

interface setterDoc {
  setDocs: Function;
}
interface docInterface {
  id: string;
  title: string;
  value: string;
  timestamp: any;
}
