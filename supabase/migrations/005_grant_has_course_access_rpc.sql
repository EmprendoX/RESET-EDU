-- RPC usado por la función Netlify `mentor-chat` (cliente service role) y, si aplica, por el cliente autenticado.
grant execute on function public.has_course_access(uuid, uuid) to authenticated;
grant execute on function public.has_course_access(uuid, uuid) to service_role;
