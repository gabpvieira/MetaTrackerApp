import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema, type InsertTransaction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function TransactionFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories, transactions, addTransaction, updateTransaction } = useFinanceStore();
  
  const isEditing = Boolean(id);
  const existingTransaction = isEditing 
    ? transactions.find((t) => t.id === id)
    : null;

  const form = useForm<InsertTransaction>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      date: existingTransaction?.date || new Date(),
      categoryId: existingTransaction?.categoryId || "",
      amount: existingTransaction?.amount || 0,
      description: existingTransaction?.description || "",
      type: existingTransaction?.type || "income",
    },
  });

  // Update type when category changes
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "categoryId" && values.categoryId) {
        const selectedCategory = categories.find((cat) => cat.id === values.categoryId);
        if (selectedCategory) {
          form.setValue("type", selectedCategory.type);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, categories]);

  const onSubmit = async (data: InsertTransaction) => {
    try {
      if (isEditing && existingTransaction) {
        await updateTransaction(existingTransaction.id, data);
        toast({
          title: "Sucesso",
          description: "Transação atualizada com sucesso!",
        });
      } else {
        await addTransaction(data);
        toast({
          title: "Sucesso",
          description: "Transação criada com sucesso!",
        });
      }
      navigate("/transacoes");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a transação.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6" data-testid="transaction-form-page">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/transacoes")}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar às Transações
          </Button>
          
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
            {isEditing ? "Editar Transação" : "Nova Transação"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEditing 
              ? "Atualize os dados da transação" 
              : "Preencha os dados para criar uma nova transação"
            }
          </p>
        </div>

        {/* Form */}
        <Card className="glass-card rounded-3xl border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-white">
              Dados da Transação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="input-transaction-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select 
                        value={field.value ?? ""} 
                        onValueChange={field.onChange}
                        disabled={categories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-transaction-category">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.filter(Boolean).map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span>{category.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({category.type === "income" ? "Receita" : "Despesa"})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {categories.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Nenhuma categoria disponível. 
                          <Button 
                            type="button" 
                            variant="link" 
                            className="p-0 h-auto text-primary underline ml-1"
                            onClick={() => navigate("/categorias")}
                          >
                            Criar categoria
                          </Button>
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-transaction-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a transação..."
                          {...field}
                          data-testid="input-transaction-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/transacoes")}
                    data-testid="button-cancel-transaction"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-primary/90 to-primary/80 hover:from-primary to-primary/90"
                    data-testid="button-save-transaction"
                  >
                    {isEditing ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}