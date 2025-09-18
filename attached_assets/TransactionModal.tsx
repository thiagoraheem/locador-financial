import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
}

interface Installment {
  number: number;
  date: string;
  value: string;
  status: string;
  dueDate: string;
}

interface TransactionData {
  empresa: string;
  tipoMovimento: string;
  emissao: string;
  vencimento: string;
  recorrencia: string;
  documento: string;
  valor: string;
  valorPago: string;
  favorecido: string;
  categoria: string;
  descricao: string;
  pagamentoConfirmado: boolean;
  dataConfirm: string;
  formaPagto: string;
  conta: string;
  codigoBarras: string;
}

export function TransactionModal({ open, onClose }: TransactionModalProps) {
  const { toast } = useToast();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installmentType, setInstallmentType] = useState("repeated");
  const [installmentQuantity, setInstallmentQuantity] = useState("15");
  const [installmentValue, setInstallmentValue] = useState("5.000,00");
  
  const [formData, setFormData] = useState<TransactionData>({
    empresa: "bbm-servicos",
    tipoMovimento: "payment",
    emissao: format(new Date(), "yyyy-MM-dd"),
    vencimento: format(new Date(), "yyyy-MM-dd"),
    recorrencia: "unique",
    documento: "",
    valor: "R$ 0,00",
    valorPago: "",
    favorecido: "",
    categoria: "",
    descricao: "",
    pagamentoConfirmado: false,
    dataConfirm: "",
    formaPagto: "nao-informado",
    conta: "",
    codigoBarras: "",
  });

  const updateFormData = (field: keyof TransactionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateInstallments = () => {
    const quantity = parseInt(installmentQuantity);
    const newInstallments: Installment[] = [];
    
    for (let i = 1; i <= quantity; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i - 1);
      
      newInstallments.push({
        number: i,
        date: format(date, "dd/MM/yyyy"),
        value: `R$ ${installmentValue}`,
        status: "Pendente",
        dueDate: format(date, "dd/MM/yyyy")
      });
    }
    
    setInstallments(newInstallments);
  };

  useEffect(() => {
    if (formData.recorrencia === "installments") {
      generateInstallments();
    }
  }, [formData.recorrencia, installmentQuantity, installmentValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    toast({
      title: "Transação salva",
      description: "A transação foi salva com sucesso.",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary">
            Lançamento de transação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Form Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa:</Label>
                  <Select 
                    value={formData.empresa} 
                    onValueChange={(value) => updateFormData("empresa", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bbm-servicos">
                        BBM SERVICOS, ALUGUEL DE MAQUINAS E TECNOLOGI...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transaction Type */}
                <div className="space-y-2">
                  <Label>Tipo Movimento:</Label>
                  <RadioGroup
                    value={formData.tipoMovimento}
                    onValueChange={(value) => updateFormData("tipoMovimento", value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="payment" id="payment" />
                      <Label htmlFor="payment">Pagamento</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="deposit" id="deposit" />
                      <Label htmlFor="deposit">Depósito</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Issue Date */}
                <div className="space-y-2">
                  <Label htmlFor="emissao">Emissão:</Label>
                  <Input
                    id="emissao"
                    type="date"
                    value={formData.emissao}
                    onChange={(e) => updateFormData("emissao", e.target.value)}
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label htmlFor="vencimento">Vencimento:</Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={formData.vencimento}
                    onChange={(e) => updateFormData("vencimento", e.target.value)}
                  />
                </div>

                {/* Recurrence */}
                <div className="space-y-2">
                  <Label htmlFor="recorrencia">Recorrência:</Label>
                  <Select 
                    value={formData.recorrencia} 
                    onValueChange={(value) => updateFormData("recorrencia", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unique">Único</SelectItem>
                      <SelectItem value="no-term">Sem previsão de término</SelectItem>
                      <SelectItem value="installments">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Document */}
                <div className="space-y-2">
                  <Label htmlFor="documento">Documento:</Label>
                  <Input 
                    id="documento" 
                    value={formData.documento}
                    onChange={(e) => updateFormData("documento", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Value */}
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor:</Label>
                  <Input 
                    id="valor" 
                    value={formData.valor}
                    onChange={(e) => updateFormData("valor", e.target.value)}
                  />
                </div>

                {/* Paid Value */}
                <div className="space-y-2">
                  <Label htmlFor="valor-pago">Valor Pago:</Label>
                  <Input 
                    id="valor-pago" 
                    value={formData.valorPago}
                    onChange={(e) => updateFormData("valorPago", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Beneficiary */}
                <div className="space-y-2">
                  <Label htmlFor="favorecido">Favorecido:</Label>
                  <Select 
                    value={formData.favorecido} 
                    onValueChange={(value) => updateFormData("favorecido", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fornecedor1">Fornecedor 1</SelectItem>
                      <SelectItem value="fornecedor2">Fornecedor 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria:</Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => updateFormData("categoria", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="categoria1">Categoria 1</SelectItem>
                      <SelectItem value="categoria2">Categoria 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição:</Label>
                <Textarea
                  id="descricao"
                  className="min-h-[80px]"
                  placeholder="Digite a descrição da transação..."
                  value={formData.descricao}
                  onChange={(e) => updateFormData("descricao", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Confirmed */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pagamento-confirmado"
                    checked={formData.pagamentoConfirmado}
                    onCheckedChange={(checked) => updateFormData("pagamentoConfirmado", checked === true)}
                  />
                  <Label htmlFor="pagamento-confirmado">Pagamento Confirmado</Label>
                </div>

                {/* Confirmation Date */}
                <div className="space-y-2">
                  <Label htmlFor="data-confirm">Data confirm.:</Label>
                  <Input
                    id="data-confirm"
                    type="date"
                    disabled={!formData.pagamentoConfirmado}
                    value={formData.dataConfirm}
                    onChange={(e) => updateFormData("dataConfirm", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="forma-pagto">Forma Pagto.:</Label>
                  <Select 
                    value={formData.formaPagto} 
                    onValueChange={(value) => updateFormData("formaPagto", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao-informado">NÃO INFORMADO</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Account */}
                <div className="space-y-2">
                  <Label htmlFor="conta">Conta:</Label>
                  <Select 
                    value={formData.conta} 
                    onValueChange={(value) => updateFormData("conta", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conta1">Conta Corrente 1</SelectItem>
                      <SelectItem value="conta2">Conta Corrente 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Barcode */}
              <div className="space-y-2">
                <Label htmlFor="codigo-barras">Código de Barras:</Label>
                <Input 
                  id="codigo-barras" 
                  value={formData.codigoBarras}
                  onChange={(e) => updateFormData("codigoBarras", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Entry Date */}
                <div className="space-y-2">
                  <Label htmlFor="data-lancamento">Data Lançamento:</Label>
                  <Input
                    id="data-lancamento"
                    type="date"
                    defaultValue={format(new Date(), "yyyy-MM-dd")}
                    disabled
                  />
                </div>

                {/* Entry User */}
                <div className="space-y-2">
                  <Label htmlFor="usuario-lancamento">Usuário:</Label>
                  <Input
                    id="usuario-lancamento"
                    defaultValue="Admin"
                    disabled
                  />
                </div>

                {/* Change Date */}
                <div className="space-y-2">
                  <Label htmlFor="data-alteracao">Data Alteração:</Label>
                  <Input
                    id="data-alteracao"
                    type="date"
                    disabled
                  />
                </div>

                {/* Change User */}
                <div className="space-y-2">
                  <Label htmlFor="usuario-alteracao">Usuário:</Label>
                  <Input
                    id="usuario-alteracao"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installments Section */}
          {formData.recorrencia === "installments" && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recorrência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo:</Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor parcelas:</Label>
                    <Input
                      value={`R$ ${installmentValue}`}
                      onChange={(e) => setInstallmentValue(e.target.value.replace("R$ ", ""))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantidade:</Label>
                    <Input
                      type="number"
                      value={installmentQuantity}
                      onChange={(e) => setInstallmentQuantity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo:</Label>
                    <RadioGroup
                      value={installmentType}
                      onValueChange={setInstallmentType}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="repeated" id="repeated" />
                        <Label htmlFor="repeated">Repetido</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="divided" id="divided" />
                        <Label htmlFor="divided">Dividido</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateInstallments}
                  >
                    Simular
                  </Button>
                </div>

                {/* Installments Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Núm.</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Pgto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installments.map((installment) => (
                        <TableRow key={installment.number}>
                          <TableCell>{installment.number}</TableCell>
                          <TableCell>{installment.date}</TableCell>
                          <TableCell>{installment.value}</TableCell>
                          <TableCell>
                            <span className="text-warning">
                              {installment.status}
                            </span>
                          </TableCell>
                          <TableCell>{installment.dueDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Converter em Contas a Pagar
            </Button>
            <Button type="submit" size="sm" className="bg-success hover:bg-success/90">
              <Save className="w-4 h-4 mr-2" />
              Gravar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}