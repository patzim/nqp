.namespace ['Regex';'P6Regex';'Grammar']

.sub 'quantifier' :method
    .param pmc action          :named('action') :optional
    .param pmc dba             :named('dba') :optional
    .tailcall self.'!protoregex'('quantifier', 'action'=>action)
.end
